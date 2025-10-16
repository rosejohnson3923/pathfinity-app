# Executive Decision Maker - Age-Appropriate Content Guidelines

## Overview

The Executive Decision Maker game adapts its content to be appropriate for different grade levels, ensuring business concepts are educational and suitable for each age group. This document outlines how content generation is controlled for different grades.

## Grade Level Adaptations

### Kindergarten (Ages 5-6)
- **Complexity**: Simple one-step problems
- **Language**: 3-5 words per sentence
- **Business Concepts**: Sharing, teamwork, helping, fairness
- **Executive Roles**: Simplified as "Helper", "Leader", "Friend"
- **Time Limit**: 2 minutes
- **Solutions**: Choose from 3 options
- **Example Scenario**: "The toy store needs more happy customers"

### Grades 1-2 (Ages 6-8)
- **Complexity**: Simple two-step solutions
- **Language**: 5-8 words per sentence
- **Business Concepts**: Customer service, making products, selling things
- **Executive Roles**: "Marketing Helper (CMO)", "Money Manager (CFO)", etc.
- **Time Limit**: 2 minutes
- **Solutions**: Choose from 3 options
- **Example Scenario**: "The bakery made too many cookies and needs to sell them"

### Grades 3-5 (Ages 8-11)
- **Complexity**: Multi-step solutions with reasoning
- **Language**: 8-12 words per sentence
- **Business Concepts**: Supply and demand, customer satisfaction, innovation
- **Executive Roles**: Basic roles with descriptions (e.g., "CMO (Marketing)")
- **Time Limit**: 90 seconds
- **Solutions**: Choose from 4 options
- **Example Scenario**: "A new competitor opened with lower prices"

### Grades 6-8 (Ages 11-14)
- **Complexity**: Complex multi-faceted solutions
- **Language**: 10-15 words per sentence
- **Business Concepts**: Market analysis, brand reputation, risk management
- **Executive Roles**: Full executive titles with brief descriptions
- **Time Limit**: 60 seconds
- **Solutions**: Choose from 5 options
- **Example Scenario**: "Social media crisis threatens brand reputation"

### Grades 9-12 (Ages 14-18)
- **Complexity**: Sophisticated multi-stakeholder solutions
- **Language**: Varied and sophisticated
- **Business Concepts**: Strategic planning, mergers, global markets
- **Executive Roles**: Professional executive titles (CMO, CFO, etc.)
- **Time Limit**: 45 seconds
- **Solutions**: Choose from 5 options
- **Example Scenario**: "Data breach requires immediate crisis response"

## Content Safety Rules

### Forbidden Topics (All Grades)
- Violence and graphic content
- Harassment or discrimination
- Substance abuse
- Death or serious injury
- Inappropriate relationships

### Additional Restrictions for Younger Grades (K-5)
- No layoffs or job loss scenarios
- No bankruptcy or financial crisis
- No complex legal issues
- No workplace accidents
- No cyber security breaches

## Implementation

### 1. AI Content Generation
When generating content through Azure OpenAI, the system:
1. Includes grade-specific constraints in the prompt
2. Validates generated content against forbidden topics
3. Adjusts language complexity automatically
4. Uses age-appropriate examples and metaphors

### 2. Template Fallbacks
Pre-written templates are categorized by grade level:
- K-2: Community helper scenarios
- 3-5: Local business challenges
- 6-8: Regional company decisions
- 9-12: Global corporate strategies

### 3. 6 C's Simplification
The 6 C's of Leadership are presented differently by grade:

**Kindergarten Version:**
- Character → "Being Good"
- Competence → "Doing Well"
- Communication → "Talking Clearly"
- Compassion → "Being Kind"
- Commitment → "Not Giving Up"
- Confidence → "Believing in Yourself"

**Elementary Version (Grades 3-5):**
- Character → "Making Right Choices"
- Competence → "Being Good at Things"
- Communication → "Explaining Ideas Well"
- Compassion → "Caring About Others"
- Commitment → "Sticking With It"
- Confidence → "Trusting Yourself"

**Middle School+ Version:**
- Uses standard business terminology

## Usage in Code

```typescript
// When generating a scenario
const scenario = await executiveDecisionAIService.generateScenario({
  scenarioType: 'crisis',
  businessDriver: 'people',
  industryContext,
  difficultyLevel: 2,
  gradeLevel: '3' // Automatically applies Grade 3 constraints
});

// The AI will:
// 1. Use 8-12 word sentences
// 2. Avoid complex business jargon
// 3. Focus on age-appropriate concepts like "teamwork" and "fairness"
// 4. Create scenarios about local businesses
// 5. Ensure all content is positive and educational
```

## Key Principles

1. **Educational First**: All scenarios teach real business concepts in age-appropriate ways
2. **Positive Focus**: Emphasize problem-solving and helping others
3. **Progressive Complexity**: Skills build from grade to grade
4. **Real-World Connection**: Use examples students can relate to
5. **Safe Content**: Strict filtering of inappropriate topics

## Testing Checklist

When reviewing content for different grades, verify:
- [ ] Language complexity matches grade level
- [ ] Scenarios use appropriate business concepts
- [ ] No forbidden topics are present
- [ ] Executive roles are presented appropriately
- [ ] Time limits and solution counts are correct
- [ ] 6 C's descriptions are grade-appropriate
- [ ] Examples connect to students' real-world experience

## Benefits

1. **Inclusive**: Students of all ages can learn business concepts
2. **Safe**: Parents and teachers can trust the content
3. **Educational**: Aligns with developmental stages
4. **Engaging**: Content relates to students' experiences
5. **Progressive**: Skills build year over year

## Future Enhancements

- Add more industry-specific scenarios for each grade
- Create grade-specific achievement systems
- Develop parent/teacher guides for each level
- Add curriculum alignment markers
- Create assessment tools for learning outcomes