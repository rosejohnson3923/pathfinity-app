# Template Mapping Example: Sam (Kindergarten) - Career Focus: CHEF 👨‍🍳

## Today's Skills Schedule (All Through Chef Lens)
- **Math A.1**: Identify numbers - up to 3
- **ELA A.1**: Find the letter in the alphabet: uppercase
- **Science A.1**: Classify objects by two-dimensional shapes
- **Social Studies A.1**: What is a community?

## Single Career, Multiple Learning Approaches

### Scenario 1: Basic Subscription Only
**Available Template**: BASIC_STANDARD
**Career**: Chef (Basic Tier)

#### Math Period → Chef Counts
**Lesson**: "Counting in the Kitchen"
- **Skill**: Identify numbers 1-3
- **Application**: Count ingredients (1 tomato, 2 carrots, 3 potatoes)
- **Activity**: "Help Chef Sam make soup with 3 ingredients"

#### ELA Period → Chef Reads
**Lesson**: "Chef's Recipe Letters"
- **Skill**: Find uppercase letters
- **Application**: Find letters on food packages (C for Cereal, M for Milk)
- **Activity**: "Circle the first letter of each ingredient"

#### Science Period → Chef Sorts
**Lesson**: "Chef's Shape Kitchen"
- **Skill**: Classify 2D shapes
- **Application**: Sort foods by shape (circle pizzas, square sandwiches, triangle chips)
- **Activity**: "Organize Chef's pantry by food shapes"

#### Social Studies → Chef Serves
**Lesson**: "Chef's Community Restaurant"
- **Skill**: What is a community?
- **Application**: Chefs feed the community, restaurants bring people together
- **Activity**: "Draw who comes to Chef Sam's restaurant"

---

### Scenario 2: Basic + AIFirst Add-on
**Available Templates**: BASIC_STANDARD, BASIC_STANDARD_AI
**Same Chef Career with AI Enhancement**

#### Math Period → Chef's AI Counter
**Lesson**: "Smart Kitchen Counting"
- **Skill**: Identify numbers 1-3
- **AI Integration**: "Ask AI: How many apples do I need for apple pie?"
- **Safe Prompts**:
  - "Show me 3 cooking ingredients"
  - "Count the eggs in my recipe"
- **Activity**: AI helps count ingredients for recipes

#### ELA Period → Chef's AI Menu Maker
**Lesson**: "AI Recipe Reader"
- **Skill**: Find uppercase letters
- **AI Integration**: "AI, find all the C words on this menu"
- **Safe Prompts**:
  - "What foods start with letter P?"
  - "Show me a menu with uppercase letters"
- **Activity**: Create menu with AI suggesting foods for each letter

#### Science Period → Chef's Shape Detector
**Lesson**: "AI Food Shape Finder"
- **Skill**: Classify 2D shapes
- **AI Integration**: "AI, what shape is this cookie?"
- **Activity**: Use AI to verify shape sorting in virtual kitchen

#### Social Studies → Chef's Community Helper AI
**Lesson**: "AI Restaurant Planner"
- **Skill**: What is a community?
- **AI Integration**: "AI, who needs food in our community?"
- **Activity**: AI helps plan a community dinner

---

### Scenario 3: Premium + Trade/Skill Booster
**Available Templates**: PREMIUM_STANDARD, PREMIUM_TRADE
**Chef Career with Hands-On Culinary Skills**

#### Math Period → Professional Kitchen Math
**Lesson**: "Real Chef Measurements"
- **Skill**: Count to 3
- **Trade Focus**: Actual measuring cups (1, 2, 3 cups)
- **Hands-On**: Use real measuring spoons
- **Certification Prep**: "ServSafe for Kids - Count to check freshness dates"

#### ELA Period → Kitchen Labeling System
**Lesson**: "Chef's Professional Labels"
- **Skill**: Find uppercase letters
- **Trade Focus**: Professional kitchen organization (label containers)
- **Tools**: Label maker practice
- **Industry Standard**: "FIFO labels (First In, First Out)"

#### Science Period → Culinary Shape Cuts
**Lesson**: "Professional Knife Cuts (Shapes)"
- **Skill**: Classify 2D shapes
- **Trade Focus**: Julienne (rectangles), Rounds (circles), Wedges (triangles)
- **Safety First**: Use plastic knives and play dough
- **Technique**: Professional presentation basics

#### Social Studies → Restaurant Operations
**Lesson**: "Running a Real Restaurant"
- **Skill**: What is a community?
- **Trade Focus**: How restaurants serve communities
- **Business Operations**: Front of house vs. back of house
- **Real Skills**: Taking orders, serving safely

---

### Scenario 4: Premium + Corporate Booster
**Available Templates**: PREMIUM_STANDARD, PREMIUM_CORPORATE
**Chef Career with Business/Management Focus**

#### Math Period → Restaurant Finance
**Lesson**: "Chef's Business Numbers"
- **Skill**: Count to 3
- **Corporate Focus**: Count money ($1, $2, $3)
- **Business Skills**: Simple pricing (cookies cost $2)
- **Professional**: Use a toy cash register

#### ELA Period → Menu Marketing
**Lesson**: "Chef's Business Writing"
- **Skill**: Find uppercase letters
- **Corporate Focus**: Create professional menus
- **Marketing**: Make signs for daily specials
- **Computer Skills**: Type menu items (find letters on keyboard)

#### Science Period → Food Product Development
**Lesson**: "Chef's R&D Department"
- **Skill**: Classify shapes
- **Corporate Focus**: Design food packaging (shapes sell products)
- **Innovation**: Create new cookie shapes for the company
- **Presentation**: Present to "board of directors" (classmates)

#### Social Studies → Corporate Catering
**Lesson**: "Chef's Catering Business"
- **Skill**: What is a community?
- **Corporate Focus**: Business events, corporate lunches
- **Professional Skills**: Taking corporate orders
- **Networking**: How chefs work with businesses

---

### Scenario 5: Premium + Entrepreneur Booster
**Available Templates**: PREMIUM_STANDARD, PREMIUM_ENTREPRENEUR
**Chef Career with Startup/Innovation Focus**

#### Math Period → Food Truck Economics
**Lesson**: "Chef's Startup Counter"
- **Skill**: Count to 3
- **Entrepreneur Focus**: Count first customers (goal: 3 customers)
- **Startup Thinking**: Price your famous dish
- **Innovation**: "3-ingredient challenge" (simple = profitable)

#### ELA Period → Brand Building
**Lesson**: "Chef's Restaurant Name"
- **Skill**: Find uppercase letters
- **Entrepreneur Focus**: Create restaurant logo with first letter
- **Branding**: "Sam's Super Sandwiches" (find all S's)
- **Marketing**: Design food truck with your letter

#### Science Period → Food Innovation Lab
**Lesson**: "Chef's New Inventions"
- **Skill**: Classify shapes
- **Entrepreneur Focus**: Invent new shaped foods
- **Problem-Solving**: "Kids don't like vegetables - make them fun shapes!"
- **Pitch**: Present your food invention

#### Social Studies → Community Food Solutions
**Lesson**: "Chef's Social Enterprise"
- **Skill**: What is a community?
- **Entrepreneur Focus**: Solve community food problems
- **Social Impact**: "How can Chef Sam help hungry families?"
- **Business Plan**: Draw your community food business idea

---

### Scenario 6: Premium + All Boosters + AIFirst
**Ultimate Package - All Approaches Available**

For each subject period, Sam's parent/teacher can choose which lens to apply to Chef career:

#### Math Period Options (All Chef-Focused):
1. **Standard**: Count ingredients (basic exploration)
2. **Trade**: Use real measuring tools (hands-on skills)
3. **Corporate**: Count restaurant revenue (business math)
4. **Entrepreneur**: Price your food invention (startup thinking)
5. **+ AI**: Any above with AI assistant helping

#### Dynamic Daily Selection Based On:
- Sam's energy level (hands-on when energetic)
- Interest that day (business when playing "store")
- Parent goals (certification track for serious culinary interest)
- Time available (AI lessons can be self-paced)

---

## Implementation Framework

### Core Architecture
```javascript
class ChefLessonGenerator {
  constructor(studentProfile, dailySkills, subscriptionLevel) {
    this.career = 'CHEF'; // Locked for the day/week/month
    this.grade = studentProfile.gradeLevel; // K
    this.skills = dailySkills; // Math A.1, ELA A.1, etc.
    this.availableTemplates = this.getTemplates(subscriptionLevel);
  }

  generateDailyLessons() {
    return this.skills.map(skill => {
      return {
        period: skill.subject,
        coreSkill: skill.objective,
        career: this.career,
        lessonVariants: this.availableTemplates.map(template =>
          this.applyTemplate(skill, this.career, template)
        )
      };
    });
  }

  applyTemplate(skill, career, template) {
    // Same skill, same career, different approach
    const baseLesson = this.getBaseLesson(skill, career);

    switch(template.application_path) {
      case 'trade_skill':
        return this.addTradeElements(baseLesson);
      case 'corporate':
        return this.addCorporateElements(baseLesson);
      case 'entrepreneur':
        return this.addEntrepreneurElements(baseLesson);
      default:
        return baseLesson;
    }
  }
}
```

### Parent Dashboard View
```
Today's Focus: CHEF 👨‍🍳

Sam is learning all subjects through the lens of being a Chef!

Morning Report:
✅ Math: Counted ingredients (used Trade/Skill approach - real measuring cups!)
✅ ELA: Found letters in recipes (used AI helper to find food words)
⏸️ Science: Learning food shapes (next: Corporate product development)
⏹️ Social Studies: Community restaurants (scheduled after lunch)

Career Engagement Score: 94% 🔥
Sam really connected with the hands-on cooking activities!

Tomorrow's Options:
1. Continue with Chef (building expertise)
2. Switch to new career (Chef mastery: 23% complete)
3. Unlock Chef Badge (complete 5 more Chef lessons)
```

### Teacher Integration
```
Curriculum Alignment Report

Standard: Math A.1 - Identify numbers up to 3
Delivery: Chef Career Context
Approach Used: Trade/Skill (hands-on)
Standard Met: ✅ Yes
Evidence: Student successfully counted 3 ingredients multiple times
Engagement: High (requested extra practice)
Assessment: 100% (counted ingredients correctly in cooking activity)
```

## Value Proposition Summary

### For Parents
"Sam isn't just learning to count - they're learning to count like a Chef, with real kitchen skills, business understanding, and future-ready AI tools."

### For Schools
"Same curriculum standards, delivered through engaging career contexts with measurable outcomes and higher engagement."

### For Students
"I'm not doing boring math - I'm being a Chef and using math to make amazing food!"

## Pricing Justification

- **Basic ($9.99)**: Learn counting through Chef stories
- **Basic + AI ($24.99)**: AI helps Sam explore Chef career
- **Premium + Trade ($34.99)**: Real cooking skills and techniques
- **Premium + Corporate ($34.99)**: Restaurant business skills
- **Premium + Entrepreneur ($34.99)**: Start your own food business
- **Premium + Everything ($59.99)**: Complete Chef mastery path with all approaches

The parent sees clear value escalation while Sam stays engaged with their chosen Chef career across ALL subjects!