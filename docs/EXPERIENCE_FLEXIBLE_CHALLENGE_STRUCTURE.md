# Experience Container - Flexible Multi-Subject Challenge Structure

## Core Understanding

The Experience container creates a dynamic number of challenges based on:
- **Student's daily lesson plan** (which subjects they're learning)
- **Grade level** (affects complexity and scenario count)
- **Selected career** (consistent across all challenges)
- **AI Companion** (Finn, Sage, etc. - continues from Learn container)

## Dynamic Structure

### Variable Number of Challenges
```typescript
// Sam (K) might have 4 subjects in their daily plan:
const samDailyPlan = {
  subjects: ['Math', 'ELA', 'Science', 'Social Studies'],
  challengeCount: 4
};

// Alex (Grade 8) might have 3 subjects:
const alexDailyPlan = {
  subjects: ['Math', 'Science', 'History'],
  challengeCount: 3
};

// Jordan (Grade 11) might have 2 subjects:
const jordanDailyPlan = {
  subjects: ['Advanced Math', 'Physics'],
  challengeCount: 2
};
```

### AI Companion Continuity
The companion that helped in Learn continues in Experience:
```typescript
interface ExperienceChallenge {
  subject: string;
  skill: LearningSkill;
  
  introduction: {
    welcome: string;       // "Welcome back, Chef Sam!"
    meet: string;          // "It's me, Finn! Ready for our chef adventure?"
    howToUse: string;      // "Let me show you how chefs use [skill]..."
  };
  
  scenarios: ScenarioChallenge[];
}
```

## Complete Data Structure

```typescript
interface AIExperienceContent {
  title: string;
  career: Career;
  companion: {
    name: string;        // "Finn" or "Sage"
    personality: string; // Their characteristic style
  };
  
  // Dynamic array - could be 2, 3, 4, or more challenges
  challenges: ExperienceChallenge[];
}

interface ExperienceChallenge {
  subject: string;              // From student's daily plan
  skill: {
    id: string;
    name: string;
    description: string;
  };
  
  introduction: {
    welcome: string;           // Career-focused greeting
    meet: string;              // AI Companion continues journey
    howToUse: string;          // How career uses this skill
  };
  
  // Dynamic scenario count based on grade
  scenarios: ScenarioChallenge[];
}

interface ScenarioChallenge {
  description: string;
  visual?: string;
  options: string[];
  correct_choice: number;
  outcome: string;
  learning_point: string;
}
```

## Scenario Count Logic

```typescript
function getScenarioCount(gradeLevel: string, subject: string): number {
  const grade = gradeLevel === 'K' ? 0 : parseInt(gradeLevel);
  
  // Base counts by grade level
  let baseCount: number;
  if (grade <= 2) {
    baseCount = 4;  // K-2: More practice, simpler scenarios
  } else if (grade <= 5) {
    baseCount = 3;  // 3-5: Moderate complexity
  } else if (grade <= 8) {
    baseCount = 3;  // 6-8: Deeper scenarios
  } else {
    baseCount = 2;  // 9-12: Complex, comprehensive scenarios
  }
  
  // Adjust for subject complexity
  const complexSubjects = ['Physics', 'Calculus', 'Chemistry', 'Advanced Math'];
  if (complexSubjects.includes(subject) && grade >= 9) {
    baseCount = Math.max(2, baseCount - 1); // Fewer but deeper
  }
  
  return baseCount;
}
```

## Example: Sam (K) with Finn as Companion

### Based on Sam's Daily Plan:
```typescript
const samExperience = {
  career: "Chef",
  companion: "Finn",
  challenges: [
    { subject: "Math", skill: "Identify numbers - up to 3" },
    { subject: "ELA", skill: "Find the letter in the alphabet: uppercase" },
    { subject: "Science", skill: "Classify objects by two-dimensional shape" },
    { subject: "Social Studies", skill: "What is a community?" }
  ]
};
```

### Challenge 1: Chef + Math with Finn

#### Introduction Page
```json
{
  "welcome": "Welcome back, Chef Sam! Ready to use math in your kitchen?",
  "meet": "Hey Chef Sam, it's me, Finn! 🦊 I had so much fun learning numbers with you! Now let's use them in your restaurant!",
  "howToUse": "As your fox friend and sous chef, I'll show you how real chefs count ingredients, measure portions, and make sure everyone gets yummy food!"
}
```

### Challenge 2: Chef + ELA with Finn

#### Introduction Page
```json
{
  "welcome": "Great job with the math, Chef Sam! Now let's work with letters!",
  "meet": "Finn here again! 🦊 Remember when we learned about letters? Now we'll use them to make menus and label your delicious dishes!",
  "howToUse": "Chefs need letters to write recipes, create menus, and organize their kitchens. Let me help you become a letter expert chef!"
}
```

## Example: Different Student (Grade 8) with Sage

### Based on Alex's Daily Plan:
```typescript
const alexExperience = {
  career: "Engineer",
  companion: "Sage",
  challenges: [
    { subject: "Algebra", skill: "Solve linear equations" },
    { subject: "Physics", skill: "Understanding force and motion" },
    { subject: "Technology", skill: "Basic programming concepts" }
  ]
};
```

### Challenge 1: Engineer + Algebra with Sage

#### Introduction Page
```json
{
  "welcome": "Welcome, Engineer Alex! Ready to apply algebra to real engineering problems?",
  "meet": "Greetings, Alex. I'm Sage, your wise owl companion. 🦉 We've mastered the theory together, now let's see how professional engineers use these equations daily.",
  "howToUse": "Engineers use algebra to calculate loads, design structures, and optimize systems. I'll guide you through real engineering scenarios."
}
```

## AI Prompt Generation Adjustments

```typescript
async generateExperienceContent(
  student: StudentProfile,
  dailyPlan: DailyLessonPlan,
  career: Career,
  companion: AICompanion
): Promise<AIExperienceContent> {
  
  // Get all subjects from daily plan
  const subjects = dailyPlan.skills.map(skill => skill.subject);
  
  const prompt = `
    Create an Experience journey for ${student.name} (Grade ${student.grade_level})
    Career: ${career.name}
    AI Companion: ${companion.name} (${companion.personality})
    
    Generate ${subjects.length} challenges, one for each subject:
    ${subjects.map((subject, i) => `
      Challenge ${i + 1}:
      - Subject: ${subject}
      - Skill: ${dailyPlan.skills[i].skill_name}
      - Scenarios: ${getScenarioCount(student.grade_level, subject)} scenarios
    `).join('\n')}
    
    For each challenge introduction, ${companion.name} should:
    - Continue their relationship from the Learn container
    - Use their characteristic personality (${companion.personality})
    - Reference the learning they did together
    - Guide them into the career application
    
    Each scenario should be:
    - Career-focused (as ${career.name})
    - Subject-appropriate
    - Grade-appropriate complexity
    - Action-oriented ("What do you do?")
  `;
}
```

## Key Implementation Requirements

### 1. Dynamic Challenge Generation
- Query student's daily lesson plan to determine subjects
- Generate appropriate number of challenges (not fixed at 4)
- Adjust scenario count per challenge based on grade/complexity

### 2. Companion Continuity
- Same AI companion from Learn continues in Experience
- Companion personality remains consistent
- References shared learning journey
- Provides encouragement in their unique style

### 3. Career Consistency
- Single career choice applies to ALL challenges
- Each subject skill is contextualized through that career lens
- Career-appropriate language and scenarios

### 4. Flexible UI Components
```typescript
interface BentoExperienceCardProps {
  totalChallenges: number;        // Dynamic based on daily plan
  currentChallenge: number;        // 1 to totalChallenges
  currentScreen: 'intro' | 'scenario';
  currentScenario?: number;        // 1 to scenarioCount
  
  career: Career;
  companion: AICompanion;
  challengeData: ExperienceChallenge;
  
  onNext: () => void;
  onComplete: () => void;
}
```

## Progress Calculation

```typescript
function calculateProgress(
  completedChallenges: number,
  currentChallenge: number,
  completedScenarios: number,
  totalChallenges: number,
  scenariosPerChallenge: number[]
): number {
  const totalScenarios = scenariosPerChallenge.reduce((a, b) => a + b, 0);
  
  const scenariosBeforeCurrent = scenariosPerChallenge
    .slice(0, currentChallenge - 1)
    .reduce((a, b) => a + b, 0);
  
  const completedTotal = scenariosBeforeCurrent + completedScenarios;
  
  return (completedTotal / totalScenarios) * 100;
}
```

## Summary

The Experience container is:
- **Flexible**: Adapts to student's daily plan (2-5+ subjects)
- **Continuous**: AI Companion continues from Learn
- **Career-Integrated**: All challenges through one career lens
- **Grade-Appropriate**: Scenario count and complexity varies
- **Personalized**: Uses student name, companion personality, and career choice throughout