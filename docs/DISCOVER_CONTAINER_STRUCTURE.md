# Discover Container - Exploration & Pattern Discovery Structure

## Container Philosophy

From Container Rules, DISCOVER focuses on:
- **Career Integration**: "Exploration - discover how careers use this in surprising ways"
- **Focus**: "Pattern recognition and curiosity building"
- **Progression**: "Explore → Question → Connect"
- **Tone**: "Inquiry-based, wonder-inducing"
- **Feedback**: "Focus on discoveries made, not just correctness"

## Core Principles

The Discover container is the **third phase** of the learning journey:
1. **LEARN**: Master the skill with structured lessons
2. **EXPERIENCE**: Apply the skill in career scenarios
3. **DISCOVER**: Explore surprising connections and patterns

## Structure Overview

Like Experience, Discover has challenges matching the daily lesson plan subjects:
- Same number of challenges as Learn/Experience
- Same subjects and skills
- Same career context throughout
- Same AI Companion continuing the journey

## Data Structure

```typescript
interface AIDiscoverContent {
  title: string;
  career: Career;
  companion: {
    name: string;        // Continues from Learn & Experience
    personality: string;
  };
  
  // Matches daily lesson plan subject count
  discoveries: DiscoveryChallenge[];
}

interface DiscoveryChallenge {
  subject: string;
  skill: {
    id: string;
    name: string;
    description: string;
  };
  
  introduction: {
    wonder: string;         // "Did you know chefs use math in surprising ways?"
    companion_insight: string; // Finn/Sage shares an interesting observation
    exploration_goal: string;  // What we're going to discover
  };
  
  // 3 intriguing examples that spark questions
  intriguing_examples: IntriguingExample[];
  
  // 5 exploration questions encouraging investigation
  exploration_activities: ExplorationActivity[];
  
  // 1 open-ended challenge
  discovery_challenge: DiscoveryChallenge;
}

interface IntriguingExample {
  title: string;
  scenario: string;
  surprising_fact: string;
  visual?: string;
  wonder_prompt: string;  // "What if...?" or "Did you ever wonder...?"
}

interface ExplorationActivity {
  type: 'what_if' | 'pattern_finding' | 'hypothesis' | 'connection_making';
  prompt: string;
  investigation: string;
  options?: string[];     // Open-ended but with suggested paths
  discovery_moment: string; // The "aha!" revelation
  learning_connection: string;
}

interface DiscoveryChallenge {
  title: string;
  open_ended_prompt: string;
  exploration_paths: string[]; // Multiple valid approaches
  creativity_encouragement: string;
  reflection_prompt: string;
}
```

## Sam (K) with Chef Career - Full Discover Structure

### Discovery 1: Chef + Math
**Skill**: "Identify numbers - up to 3"

#### Introduction
```json
{
  "wonder": "Did you know chefs use numbers in magical ways you've never imagined?",
  "companion_insight": "Hey Chef Sam! It's Finn! 🦊 I discovered something amazing - chefs don't just count ingredients, they use numbers to create art and make people happy!",
  "exploration_goal": "Let's explore the secret ways chefs use numbers 1, 2, and 3!"
}
```

#### Intriguing Examples (3)
```json
[
  {
    "title": "The Rule of Three in Plating",
    "scenario": "Famous chefs always put 3 items on fancy plates!",
    "surprising_fact": "Our brains think 3 things look most beautiful!",
    "visual": "🥕 🥔 🥦",
    "wonder_prompt": "Why do you think 3 looks better than 2 or 4?"
  },
  {
    "title": "The Two-Bite Wonder",
    "scenario": "Appetizers are made to eat in exactly 2 bites!",
    "surprising_fact": "Two bites lets you taste everything perfectly!",
    "visual": "🥟 → 😋 😋",
    "wonder_prompt": "What if food was too big for 2 bites?"
  },
  {
    "title": "The One-Pot Magic",
    "scenario": "Some amazing meals use just 1 pot for everything!",
    "surprising_fact": "One pot can feed a whole family!",
    "visual": "🍲",
    "wonder_prompt": "How many different foods could fit in 1 pot?"
  }
]
```

#### Exploration Activities (5)
```json
[
  {
    "type": "what_if",
    "prompt": "What if you could only use 2 ingredients to make lunch?",
    "investigation": "Let's explore which 2 ingredients make the best combinations!",
    "options": ["🍞 + 🧈", "🍝 + 🧀", "🍎 + 🥜"],
    "discovery_moment": "Wow! Just 2 ingredients can make something delicious!",
    "learning_connection": "The number 2 helps chefs create simple, tasty meals!"
  },
  {
    "type": "pattern_finding",
    "prompt": "Look at these chef hats. Can you find the pattern?",
    "investigation": "👨‍🍳 👨‍🍳👨‍🍳 👨‍🍳 👨‍🍳👨‍🍳 👨‍🍳 ?",
    "options": ["1 chef", "2 chefs", "3 chefs"],
    "discovery_moment": "The pattern is 1, 3, 1, 3! Patterns help chefs organize!",
    "learning_connection": "Recognizing number patterns helps in the kitchen!"
  },
  {
    "type": "hypothesis",
    "prompt": "If you have 3 cookies, how many ways can you share them?",
    "investigation": "Let's predict before we try!",
    "options": ["Give all 3 to one friend", "Give 2 to one, 1 to another", "Give 1 to each of 3 friends"],
    "discovery_moment": "There are 3 different ways to share 3 cookies!",
    "learning_connection": "Numbers help chefs plan sharing and portions!"
  },
  {
    "type": "connection_making",
    "prompt": "How are traffic lights like a chef's cooking timer?",
    "investigation": "Both use 3 signals! Let's explore...",
    "options": ["🔴 Stop/Not ready", "🟡 Wait/Almost done", "🟢 Go/Ready to eat"],
    "discovery_moment": "The number 3 helps organize signals everywhere!",
    "learning_connection": "Chefs use 3-step systems just like traffic lights!"
  },
  {
    "type": "what_if",
    "prompt": "What if restaurants only had tables for 1 person?",
    "investigation": "How would eating together change?",
    "options": ["Everyone eats alone", "We'd need 3 tables for a family of 3", "Sharing food would be hard"],
    "discovery_moment": "Numbers help us understand togetherness!",
    "learning_connection": "Chefs use numbers to bring people together!"
  }
]
```

#### Discovery Challenge
```json
{
  "title": "Create Your Own 1-2-3 Recipe!",
  "open_ended_prompt": "Design a snack using exactly 1, 2, or 3 of something. Be creative!",
  "exploration_paths": [
    "Use 1 type of fruit",
    "Use 2 different colors",
    "Use 3 different shapes"
  ],
  "creativity_encouragement": "There's no wrong answer! Every chef creates differently!",
  "reflection_prompt": "What did you discover about using numbers in cooking?"
}
```

### Discovery 2: Chef + ELA
**Skill**: "Find the letter in the alphabet: uppercase"

#### Introduction
```json
{
  "wonder": "Did you know letters hide secret messages in every restaurant?",
  "companion_insight": "Chef Sam, Finn here! 🦊 I found out that chefs use letters like secret codes! Menu letters tell stories!",
  "exploration_goal": "Let's discover the mysterious ways chefs use letters!"
}
```

#### Intriguing Examples (3)
```json
[
  {
    "title": "The ABC Menu Mystery",
    "scenario": "Some restaurants organize menus alphabetically!",
    "surprising_fact": "A for Appetizers, B for Burgers, C for Cake!",
    "visual": "A🥗 B🍔 C🍰",
    "wonder_prompt": "What other foods could go with each letter?"
  },
  {
    "title": "The Chef's Signature",
    "scenario": "Chefs sign their dishes with their initial!",
    "surprising_fact": "Chef Sam would use 'S' on special dishes!",
    "visual": "S ✨",
    "wonder_prompt": "If you were a chef, what letter would be yours?"
  },
  {
    "title": "The First Letter Food Game",
    "scenario": "Restaurants play games where foods match first letters!",
    "surprising_fact": "Pizza starts with P, just like Pasta and Pie!",
    "visual": "P: 🍕🍝🥧",
    "wonder_prompt": "How many foods can you think of that start with P?"
  }
]
```

### Discovery 3: Chef + Science
**Skill**: "Classify objects by two-dimensional shape"

#### Introduction
```json
{
  "wonder": "Did you know chefs are secret shape scientists?",
  "companion_insight": "Sam! It's Finn! 🦊 Chefs use shapes to make food taste better! It's like magic but it's science!",
  "exploration_goal": "Let's discover how shapes change the way food tastes and looks!"
}
```

#### Intriguing Examples (3)
```json
[
  {
    "title": "The Circle Makes It Sweeter",
    "scenario": "Round cookies seem to taste sweeter than square ones!",
    "surprising_fact": "Our brains think round = sweet!",
    "visual": "●🍪 vs ■🍪",
    "wonder_prompt": "Why do you think circles seem sweeter?"
  },
  {
    "title": "Triangle Sandwiches Taste Fancier",
    "scenario": "Hotels cut sandwiches into triangles to seem fancy!",
    "surprising_fact": "The same sandwich tastes different in different shapes!",
    "visual": "■🥪 → ▲▲",
    "wonder_prompt": "What if we cut sandwiches into circles?"
  },
  {
    "title": "Square Plates Make Food Look Bigger",
    "scenario": "The same amount of food looks like more on a square plate!",
    "surprising_fact": "Shapes trick our eyes and stomachs!",
    "visual": "●🍽️ vs ■🍽️",
    "wonder_prompt": "Which plate shape would make you feel fuller?"
  }
]
```

### Discovery 4: Chef + Social Studies
**Skill**: "What is a community?"

#### Introduction
```json
{
  "wonder": "Did you know every restaurant is like a tiny community?",
  "companion_insight": "Chef Sam, Finn here! 🦊 I discovered that restaurants are where communities come alive! Every meal brings people together!",
  "exploration_goal": "Let's explore how food creates and connects communities!"
}
```

#### Intriguing Examples (3)
```json
[
  {
    "title": "The Community Recipe Book",
    "scenario": "Towns collect everyone's family recipes in one book!",
    "surprising_fact": "Every family adds their special dish to share!",
    "visual": "👨‍👩‍👧 → 📖 ← 👴👵",
    "wonder_prompt": "What recipe would your family share?"
  },
  {
    "title": "The Helping Table",
    "scenario": "Some restaurants have a 'pay it forward' meal board!",
    "surprising_fact": "People buy meals for strangers who need them!",
    "visual": "💝🍽️→😊",
    "wonder_prompt": "How does sharing food help a community?"
  },
  {
    "title": "The Festival Food Chain",
    "scenario": "Community festivals need many helpers working together!",
    "surprising_fact": "It takes 20 people to run one food booth!",
    "visual": "👥👥👥→🎪",
    "wonder_prompt": "What if everyone tried to work alone?"
  }
]
```

## Key Differences from Experience Container

### Discover IS:
- **Exploration-focused**: "What if?" and "I wonder..." questions
- **Pattern-finding**: Discovering connections and relationships
- **Open-ended**: Multiple correct paths and answers
- **Curiosity-driven**: Celebrates questions as much as answers
- **Connection-making**: Links to unexpected real-world applications

### Discover IS NOT:
- **Task completion**: No specific "right" way to do things
- **Skill testing**: Focus on discovery, not assessment
- **Linear progression**: Exploration can go many directions
- **Career simulation**: More about surprising connections than job tasks

## Implementation Requirements

### 1. AI Prompt Structure for Discover
```javascript
const discoverPrompt = `
Create a DISCOVER journey for ${student.name} (Grade ${student.grade_level})
Career: ${career.name}
Companion: ${companion.name}

For each of the ${subjects.length} subjects, create explorations that:

1. INTRIGUING EXAMPLES (3 per subject):
   - Surprising ways ${career.name}s use this skill
   - "Did you know?" facts that amaze
   - Visual elements that spark curiosity
   - "What if?" wonder prompts

2. EXPLORATION ACTIVITIES (5 per subject):
   - Mix of: what_if scenarios, pattern finding, hypothesis testing, connection making
   - Open-ended investigations
   - Multiple valid exploration paths
   - "Aha!" discovery moments
   - Not testing for correctness, but celebrating discoveries

3. DISCOVERY CHALLENGE (1 per subject):
   - Completely open-ended
   - Creative application
   - No single correct answer
   - Reflection on discoveries made

Tone: Wonder-inducing, curiosity-celebrating, exploration-encouraging
Focus: Patterns, connections, and surprising applications
${companion.name} should: Express excitement about discoveries, ask "what if" questions, celebrate creative thinking
`;
```

### 2. Progress Tracking
- Less about "correct" answers
- More about "discoveries made"
- Track exploration paths taken
- Celebrate creative solutions
- XP for curiosity and investigation

### 3. UI Considerations
```typescript
interface BentoDiscoverCardProps {
  currentDiscovery: number;        // Which subject (1 to total)
  currentPhase: 'intro' | 'examples' | 'exploration' | 'challenge';
  currentActivity?: number;        // Which exploration activity (1-5)
  
  career: Career;
  companion: AICompanion;
  discoveryData: DiscoveryChallenge;
  
  onExplore: (path: string) => void;  // Track exploration choices
  onDiscover: (discovery: any) => void; // Record discoveries made
  onNext: () => void;
}
```

## Learning Journey Progression

1. **LEARN**: "Here's how to identify numbers up to 3"
2. **EXPERIENCE**: "Use numbers 1-3 as a chef in these scenarios"
3. **DISCOVER**: "Explore surprising ways chefs use 1, 2, and 3 in the world!"

Each container builds on the previous, creating a complete learning arc from knowledge → application → exploration.