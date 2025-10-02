# Template Mapping Example: Sam (Kindergarten)

## Today's Skills Schedule
- **Math A.1**: Identify numbers - up to 3
- **ELA A.1**: Find the letter in the alphabet: uppercase
- **Science A.1**: Classify objects by two-dimensional shapes
- **Social Studies A.1**: What is a community?

## Subscription Scenarios & Template Applications

### Scenario 1: Basic Subscription Only
**Available Template**: BASIC_STANDARD
**Career Pool**: Elementary Basic Careers (e.g., Teacher, Police Officer, Firefighter)

#### Math Period → Police Officer
**Lesson**: "Counting with Officer Safety"
- **Skill Integration**: Identify numbers 1-3
- **Career Context**: Police officers use numbers for:
  - Badge numbers (show badges with 1, 2, 3)
  - Counting safety rules (3 safety rules)
  - Radio codes (simple 1, 2, 3 codes)
- **Activity**: "Help Officer Sam count the stop signs in the neighborhood (up to 3)"

#### ELA Period → Teacher
**Lesson**: "Teacher's Alphabet Adventure"
- **Skill Integration**: Find uppercase letters
- **Career Context**: Teachers use letters to:
  - Write on the board (find letter T for Teacher)
  - Make name tags (find first letter of your name)
  - Read stories (spot uppercase letters in book titles)
- **Activity**: "Be a teacher and help teddy bear find letter T in the classroom"

---

### Scenario 2: Basic + AIFirst Add-on
**Available Templates**: BASIC_STANDARD, BASIC_STANDARD_AI
**Same Career Pool with AI Enhancement**

#### Math Period → Police Officer (AI-Enhanced)
**Lesson**: "Officer's AI Helper Counts"
- **Skill Integration**: Identify numbers 1-3
- **Career Context**: Modern police use AI to:
  - Count cars with traffic cameras
  - Find lost pets (show 1, 2, or 3 pets)
- **AI Activity**: "Ask the AI helper: 'Show me 2 police cars' and count them together"
- **Safe Prompts**:
  - "Help me count police badges"
  - "How many traffic lights do you see?"

#### ELA Period → Teacher (AI-Enhanced)
**Lesson**: "Teacher's Smart Board Letters"
- **Skill Integration**: Find uppercase letters
- **Career Context**: Teachers use AI smart boards
- **AI Activity**: "Tell the AI: 'Find all the letter A's in this word'"
- **Safe Prompts**:
  - "Show me words that start with B"
  - "Find the uppercase letters in my name"

---

### Scenario 3: Premium + Trade/Skill Booster
**Available Templates**: PREMIUM_STANDARD, PREMIUM_TRADE
**Career Pool**: Premium Careers (e.g., Chef, Carpenter, Mechanic)

#### Math Period → Chef (Trade/Skill Focus)
**Lesson**: "Chef's Recipe Counter"
- **Skill Integration**: Count ingredients up to 3
- **Trade Context**: Real kitchen skills:
  - Measure 3 cups of flour
  - Count cooking tools
  - Set timer for 3 minutes
- **Hands-on**: "Make a pretend pizza with 3 toppings"
- **Certification Prep**: Basic food safety (wash hands 3 times)

#### Science Period → Carpenter (Trade/Skill Focus)
**Lesson**: "Builder's Shape Sorter"
- **Skill Integration**: Classify 2D shapes
- **Trade Context**: Carpenters use shapes:
  - Square windows
  - Rectangle doors
  - Circle saw blades
- **Hands-on**: "Sort wood pieces by shape"
- **Tool Introduction**: "Match the tool to its shape"

---

### Scenario 4: Premium + Corporate Booster
**Available Templates**: PREMIUM_STANDARD, PREMIUM_CORPORATE
**Career Pool**: Premium Careers with Office Skills

#### Math Period → Accountant (Corporate Focus)
**Lesson**: "Office Number Detective"
- **Skill Integration**: Identify numbers 1-3
- **Corporate Context**: Office workers count:
  - Computer screens (1, 2, or 3)
  - Office supplies (3 pencils)
  - Meeting rooms (Room 1, 2, 3)
- **Professional Skills**: "Practice counting money (1, 2, 3 coins)"
- **Office Etiquette**: "Knock 3 times before entering"

#### ELA Period → Marketing Manager (Corporate Focus)
**Lesson**: "Logo Letter Finder"
- **Skill Integration**: Find uppercase letters
- **Corporate Context**: Marketing uses letters in:
  - Company logos
  - Billboard signs
  - Business cards
- **Professional Activity**: "Design a simple logo with letter M"
- **Computer Skills**: "Find letters on the keyboard"

---

### Scenario 5: Premium + Entrepreneur Booster
**Available Templates**: PREMIUM_STANDARD, PREMIUM_ENTREPRENEUR
**Career Pool**: Premium Careers with Business Building

#### Math Period → Store Owner (Entrepreneur Focus)
**Lesson**: "My First Store Counter"
- **Skill Integration**: Count items up to 3
- **Entrepreneur Context**: Store owners count:
  - Products to sell (3 toys)
  - Customers (up to 3)
  - Dollars earned (1, 2, 3)
- **Business Skills**: "Set up a pretend store with 3 items"
- **Innovation**: "Think of 3 things kids would buy"

#### Social Studies Period → Community Business Leader (Entrepreneur Focus)
**Lesson**: "Building Our Community Business"
- **Skill Integration**: What is a community?
- **Entrepreneur Context**: Businesses help communities:
  - Ice cream shop makes people happy
  - Toy store gives kids fun
  - Bookstore helps kids learn
- **Business Plan**: "Draw your dream community business"
- **Problem Solving**: "What does our community need?"

---

### Scenario 6: Premium + All Boosters + AIFirst
**Available Templates**: ALL 10 TYPES
**Ultimate Flexibility - Choose based on mood/interest**

#### Dynamic Selection per Period
The system would offer Sam's parent/teacher options:

**Math Period Options**:
1. **Standard**: Basic counting with any career
2. **Trade-Ready**: Hands-on counting with tools
3. **Corporate-Bound**: Office number skills
4. **Mini-Entrepreneur**: Business counting basics
5. **AI-Powered**: Any above with AI assistant

**The AI Layer adds**:
- Voice assistant for counting help
- Visual AI to verify shape sorting
- Story AI to create career adventures
- Safe chat to answer "why" questions

---

## Key Implementation Points

### 1. Skill Mapping Algorithm
```javascript
function mapSkillToLesson(skill, career, templateType) {
  // Core skill remains constant
  const coreSkill = skill.objective; // "Identify numbers up to 3"

  // Career provides context
  const careerContext = career.realWorldApplication;

  // Template determines approach
  const approach = templateType.applicationPath;

  return generateLesson(coreSkill, careerContext, approach);
}
```

### 2. Grade-Appropriate Adaptations
- **Kindergarten**: 5-minute segments, visual-heavy, hands-on
- **Time**: Each lesson component scales to age:
  - Warm-up: 2 minutes (K) vs 5 minutes (5th)
  - Practice: 5 minutes (K) vs 15 minutes (5th)

### 3. Subscription Validation
```javascript
function getAvailableTemplates(subscription) {
  const templates = [];

  // Base access
  if (subscription.tier === 'basic') {
    templates.push('BASIC_STANDARD');
  } else if (subscription.tier === 'premium') {
    templates.push('PREMIUM_STANDARD');
  }

  // Booster access
  if (subscription.boosters.includes('trade_skill')) {
    templates.push('PREMIUM_TRADE');
  }

  // AI enhancement
  if (subscription.ai_first) {
    templates = templates.map(t => [t, `${t}_AI`]).flat();
  }

  return templates;
}
```

### 4. Daily Lesson Generation
Each morning, the system:
1. Pulls Sam's daily skills from curriculum
2. Checks Sam's subscription level
3. Matches skills to available careers
4. Applies appropriate template
5. Generates personalized lessons
6. Delivers through LMS or app

## Parent Communication Example

**Daily Summary for Sam's Parent**:
"Today Sam learned counting while exploring Police Officer careers. They successfully identified numbers 1-3 by counting police badges and safety rules. Tomorrow, they'll use these same math skills to explore Chef careers, counting ingredients for recipes!"

## Teacher Dashboard View

**Sam's Progress Today**:
- ✅ Math A.1 + Police Officer (Standard): 100% complete
- ✅ ELA A.1 + Teacher (AI-Enhanced): 85% complete
- ⏸️ Science A.1 + Carpenter (Trade): In progress
- ⏹️ Social Studies A.1: Not started

**Engagement Score**: 87% (High)
**Career Interest Detected**: Law Enforcement, Education
**Recommended Tomorrow**: Continue Police theme with "Police Dog Counter" lesson