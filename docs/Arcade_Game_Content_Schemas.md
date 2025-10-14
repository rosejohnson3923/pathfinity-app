# Discovered Live! Arcade - Content Schemas

## Overview
This document defines the `content_data` JSONB structure for each game mechanic type.

---

## 1. BINGO - Content Schema

### Content Type: `clue`

```typescript
interface BingoClueContent {
  // Subject reference
  subject_id: string;        // career_code, skill_code, etc.
  subject_name: string;      // "Chef", "Addition", etc.

  // Clue
  prompt: string;            // "I prepare delicious meals in restaurants"
  answer: string;            // "Chef"
  skill_connection: string;  // "Food preparation and culinary arts"

  // Distractors for multiple-choice presentation
  distractors: string[];     // ["Waiter", "Farmer", "Nutritionist"]

  // Optional metadata
  hint?: string;             // Additional help if student is stuck
  image_url?: string;        // Visual clue
}
```

### Example:
```json
{
  "subject_id": "chef",
  "subject_name": "Chef",
  "prompt": "I prepare delicious meals in restaurants",
  "answer": "Chef",
  "skill_connection": "Food preparation and culinary arts",
  "distractors": ["Waiter", "Farmer", "Nutritionist"],
  "hint": "Works in a kitchen",
  "image_url": "/images/careers/chef.jpg"
}
```

---

## 2. RESOURCE_MANAGEMENT - Content Schema

### Content Type: `resource_event`

```typescript
interface ResourceEventContent {
  // Event identification
  event_id: string;
  event_title: string;       // "Client Request: Rush Order"
  event_description: string; // Full scenario text

  // Career context
  career_code: string;
  career_situation: string;  // "As a chef, you receive a rush order..."

  // Resource impact options
  options: Array<{
    id: string;
    label: string;          // "Accept the order"
    description: string;    // What this choice means

    // Resource costs/gains
    resource_changes: {
      [resource_name: string]: number; // {"time": -5, "money": 100}
    };

    // Consequences
    outcome_description: string;
    reputation_impact?: number; // -10 to +10

    // Learning feedback
    is_optimal: boolean;
    feedback: string;
  }>;

  // Difficulty tuning
  time_pressure?: number;    // Seconds to decide
  stakes_level: 'low' | 'medium' | 'high';
}
```

### Example:
```json
{
  "event_id": "chef_rush_order_001",
  "event_title": "Rush Order Request",
  "event_description": "A VIP customer calls with a special request for 20 gourmet meals for tonight's event, offering to pay double.",
  "career_code": "chef",
  "career_situation": "As a head chef, you must decide whether to accept this lucrative but demanding order.",
  "options": [
    {
      "id": "accept",
      "label": "Accept the order",
      "description": "Work overtime with your team to fulfill the order",
      "resource_changes": {
        "time": -8,
        "money": 200,
        "energy": -15
      },
      "outcome_description": "Your team works hard and delivers excellent food. The client is thrilled!",
      "reputation_impact": 5,
      "is_optimal": true,
      "feedback": "Great choice! Taking calculated risks can lead to growth and reputation."
    },
    {
      "id": "decline",
      "label": "Politely decline",
      "description": "Explain you can't meet this timeline with quality",
      "resource_changes": {
        "time": 0,
        "money": 0,
        "energy": 0
      },
      "outcome_description": "The client understands but is disappointed. They may not return.",
      "reputation_impact": -2,
      "is_optimal": false,
      "feedback": "Sometimes saying no protects quality, but you missed a growth opportunity."
    },
    {
      "id": "negotiate",
      "label": "Negotiate terms",
      "description": "Offer a smaller menu for same price",
      "resource_changes": {
        "time": -4,
        "money": 150,
        "energy": -8
      },
      "outcome_description": "The client agrees to a modified menu. You deliver great food without overwhelming your team.",
      "reputation_impact": 3,
      "is_optimal": true,
      "feedback": "Excellent! Negotiation shows professionalism and problem-solving."
    }
  ],
  "time_pressure": 30,
  "stakes_level": "high"
}
```

---

## 3. DECISION_TREE - Content Schema

### Content Type: `decision_node`

```typescript
interface DecisionNodeContent {
  // Node identification
  node_id: string;
  node_type: 'root' | 'branch' | 'leaf';
  depth: number;              // 0 = start, increases with each level

  // Story context
  situation_title: string;    // "Choosing Your Education Path"
  situation_description: string; // Full narrative
  character_state?: {
    skills: string[];
    experience_level: number;
    resources: Record<string, number>;
  };

  // Career context
  career_code?: string;
  career_stage: 'education' | 'entry_level' | 'mid_career' | 'senior';

  // Decision point
  decision_prompt: string;    // "What do you do next?"
  choices: Array<{
    id: string;
    label: string;            // "Attend culinary school"
    description: string;      // Details about this choice

    // Branching
    leads_to_node?: string;   // Next node_id (null if leaf)

    // Immediate consequences
    immediate_outcome: string;
    skill_gained?: string[];
    xp_impact: number;

    // Long-term implications
    career_impact: {
      timeline: string;       // "+2 years"
      opportunities_opened: string[];
      opportunities_closed: string[];
    };

    // Educational feedback
    is_recommended: boolean;
    mentor_advice: string;
  }>;

  // Visual elements
  image_url?: string;
  background_music?: string;
}
```

### Example:
```json
{
  "node_id": "chef_education_01",
  "node_type": "root",
  "depth": 0,
  "situation_title": "Starting Your Culinary Journey",
  "situation_description": "You've just graduated high school with a passion for cooking. Your family restaurant needs help, but you also dream of formal culinary training.",
  "character_state": {
    "skills": ["home_cooking", "passion"],
    "experience_level": 1,
    "resources": {"money": 1000, "time": 100}
  },
  "career_code": "chef",
  "career_stage": "education",
  "decision_prompt": "What path will you choose?",
  "choices": [
    {
      "id": "culinary_school",
      "label": "Attend Culinary School",
      "description": "Enroll in a 2-year culinary arts program to learn professional techniques, kitchen management, and food safety.",
      "leads_to_node": "chef_school_experience_01",
      "immediate_outcome": "You begin intensive culinary training with experienced chefs as instructors.",
      "skill_gained": ["knife_skills", "french_technique", "food_safety", "plating"],
      "xp_impact": 50,
      "career_impact": {
        "timeline": "+2 years",
        "opportunities_opened": ["fine_dining", "hotel_chains", "culinary_instructor"],
        "opportunities_closed": []
      },
      "is_recommended": true,
      "mentor_advice": "Formal training opens doors to prestigious kitchens and gives you a strong foundation."
    },
    {
      "id": "family_restaurant",
      "label": "Work at Family Restaurant",
      "description": "Start working immediately at your family's restaurant, learning hands-on while earning money.",
      "leads_to_node": "chef_family_business_01",
      "immediate_outcome": "You dive into the restaurant business, learning from your family's recipes and regular customers.",
      "skill_gained": ["customer_service", "traditional_recipes", "business_basics"],
      "xp_impact": 30,
      "career_impact": {
        "timeline": "immediate",
        "opportunities_opened": ["restaurant_owner", "catering", "food_truck"],
        "opportunities_closed": ["fine_dining"]
      },
      "is_recommended": false,
      "mentor_advice": "Starting immediately gives you business experience, but formal training might be harder to get later."
    },
    {
      "id": "apprenticeship",
      "label": "Seek Apprenticeship",
      "description": "Apply to work under a master chef as an apprentice, combining work with mentored learning.",
      "leads_to_node": "chef_apprentice_01",
      "immediate_outcome": "You're accepted as an apprentice at a local fine dining establishment.",
      "skill_gained": ["professional_standards", "advanced_technique", "work_ethic"],
      "xp_impact": 40,
      "career_impact": {
        "timeline": "+3 years",
        "opportunities_opened": ["sous_chef", "specialized_cuisine", "restaurant_chains"],
        "opportunities_closed": []
      },
      "is_recommended": true,
      "mentor_advice": "Apprenticeships offer the best of both worlds - earning while learning from masters."
    }
  ],
  "image_url": "/images/scenarios/kitchen_crossroads.jpg"
}
```

---

## 4. SCENARIO_ROLEPLAY - Content Schema

### Content Type: `scenario_challenge`

```typescript
interface ScenarioRoleplayContent {
  // Scenario identification
  scenario_id: string;
  scenario_title: string;     // "Morning Prep at the Restaurant"
  scenario_type: 'day_in_life' | 'crisis_response' | 'skill_challenge';

  // Career context
  career_code: string;
  career_role: string;        // "Sous Chef at upscale restaurant"

  // Immersive setup
  setting: {
    location: string;         // "Professional kitchen, 6:00 AM"
    atmosphere: string;       // "Quiet before service begins..."
    time_of_day: string;
    season?: string;
  };

  // Challenge sequence
  challenges: Array<{
    challenge_id: string;
    order: number;

    // Challenge presentation
    title: string;            // "Inventory Check"
    description: string;      // Full scenario text
    challenge_type: 'decision' | 'task' | 'problem_solving' | 'interaction';

    // Task details
    task: {
      prompt: string;         // "You notice the fish delivery is late..."
      context: string;        // Additional situation details
      time_limit?: number;    // Seconds for realism
    };

    // Response options
    options: Array<{
      id: string;
      action: string;         // "Call the supplier immediately"
      reasoning?: string;     // Why someone might choose this

      // Evaluation
      is_correct: boolean;
      is_professional: boolean;

      // Immediate feedback
      outcome: string;
      performance_scores: {
        professionalism: number;    // 0-100
        efficiency: number;
        problem_solving: number;
        teamwork: number;
      };

      // Learning feedback
      mentor_feedback: string;
      industry_insight: string;  // Real-world perspective
      xp_earned: number;
    }>;

    // Media
    image_url?: string;
    audio_cue?: string;       // Ambient sounds
  }>;

  // Performance tracking
  success_criteria: {
    min_professionalism: number;
    min_efficiency: number;
    min_problem_solving: number;
    min_teamwork: number;
  };

  // Immersive elements
  npc_characters?: Array<{
    name: string;
    role: string;
    personality: string;
    avatar_url?: string;
  }>;
}
```

### Example:
```json
{
  "scenario_id": "chef_morning_prep_001",
  "scenario_title": "Morning Prep at Bella Vista",
  "scenario_type": "day_in_life",
  "career_code": "chef",
  "career_role": "Sous Chef at upscale Italian restaurant",
  "setting": {
    "location": "Professional kitchen at Bella Vista Restaurant",
    "atmosphere": "Calm before the storm - the kitchen is clean and quiet, but lunch service starts in 3 hours.",
    "time_of_day": "6:00 AM",
    "season": "Spring"
  },
  "challenges": [
    {
      "challenge_id": "inventory_issue",
      "order": 1,
      "title": "Supplier Problem",
      "description": "You're doing your morning inventory check when you realize the fresh fish delivery hasn't arrived. You have reservations for 50 people tonight, and 15 of them pre-ordered the special: Pan-Seared Branzino.",
      "challenge_type": "problem_solving",
      "task": {
        "prompt": "The fish supplier just called - their truck broke down and can't deliver until 2 PM. Lunch service starts at 11 AM. What's your first move?",
        "context": "You have: 3 hours until lunch service, a full dinner menu planned around this fish, and a head chef who trusts your judgment.",
        "time_limit": 45
      },
      "options": [
        {
          "id": "alt_supplier",
          "action": "Call your backup fish supplier immediately",
          "reasoning": "Need to secure fish from another source fast",
          "is_correct": true,
          "is_professional": true,
          "outcome": "You reach your backup supplier. They can deliver fresh branzino by 9 AM, but it costs 20% more. You make the call and notify the head chef.",
          "performance_scores": {
            "professionalism": 95,
            "efficiency": 90,
            "problem_solving": 95,
            "teamwork": 80
          },
          "mentor_feedback": "Excellent! Having backup suppliers is professional kitchen management. You solved the problem quickly without compromising quality.",
          "industry_insight": "Top chefs always have backup suppliers and maintain good relationships with multiple vendors for exactly this reason.",
          "xp_earned": 15
        },
        {
          "id": "menu_change",
          "action": "Change the lunch specials to dishes you have ingredients for",
          "reasoning": "Adapt the menu to available ingredients",
          "is_correct": true,
          "is_professional": true,
          "outcome": "You quickly revise the lunch menu to feature your excellent pasta dishes instead. Guests never know there was a problem.",
          "performance_scores": {
            "professionalism": 90,
            "efficiency": 85,
            "problem_solving": 90,
            "teamwork": 85
          },
          "mentor_feedback": "Good thinking! Adapting the menu shows resourcefulness. However, you still need to address the dinner reservations.",
          "industry_insight": "Flexibility is key in a kitchen. The best chefs can pivot quickly when problems arise.",
          "xp_earned": 12
        },
        {
          "id": "wait_hope",
          "action": "Wait and hope the truck gets fixed in time",
          "reasoning": "The supplier might fix it faster than expected",
          "is_correct": false,
          "is_professional": false,
          "outcome": "Two hours pass with no update. Now you're scrambling last minute, the head chef is stressed, and you have to make emergency calls to multiple suppliers.",
          "performance_scores": {
            "professionalism": 40,
            "efficiency": 30,
            "problem_solving": 25,
            "teamwork": 45
          },
          "mentor_feedback": "In a professional kitchen, hope is not a strategy. Always have a proactive backup plan.",
          "industry_insight": "Waiting until a problem becomes a crisis is how restaurants lose customers and damage their reputation.",
          "xp_earned": 3
        },
        {
          "id": "panic_call_chef",
          "action": "Immediately call the head chef at home in a panic",
          "reasoning": "This is too big a decision for me to make",
          "is_correct": false,
          "is_professional": false,
          "outcome": "The head chef is frustrated you woke them up for something you should handle. They tell you to call the backup supplier - something you could have done yourself.",
          "performance_scores": {
            "professionalism": 45,
            "efficiency": 50,
            "problem_solving": 40,
            "teamwork": 55
          },
          "mentor_feedback": "As sous chef, you're expected to handle supplier issues independently. Build confidence in your problem-solving abilities.",
          "industry_insight": "Part of growing as a chef is taking ownership of problems and making decisions. Save the head chef's time for truly major issues.",
          "xp_earned": 5
        }
      ],
      "image_url": "/images/scenarios/kitchen_morning.jpg",
      "audio_cue": "quiet_kitchen_ambience.mp3"
    }
  ],
  "success_criteria": {
    "min_professionalism": 70,
    "min_efficiency": 65,
    "min_problem_solving": 70,
    "min_teamwork": 60
  },
  "npc_characters": [
    {
      "name": "Chef Marco",
      "role": "Head Chef",
      "personality": "Demanding but fair, expects professionalism",
      "avatar_url": "/avatars/chef_marco.jpg"
    },
    {
      "name": "Lisa",
      "role": "Line Cook",
      "personality": "Energetic and always ready to help",
      "avatar_url": "/avatars/lisa_cook.jpg"
    }
  ]
}
```

---

## Content Generation Guidelines

### For All Content Types:

1. **Grade-Appropriate Language**:
   - Elementary (K-5): 5-7 words, simple vocabulary
   - Middle (6-8): 10-15 words, some technical terms with context
   - High (9-12): Varied length, industry-specific terminology

2. **Real-World Accuracy**:
   - All scenarios should reflect actual career situations
   - Use real industry terminology
   - Consequences should be realistic

3. **Educational Value**:
   - Every interaction should teach something
   - Include "mentor feedback" or "industry insights"
   - Connect to academic skills when possible

4. **Diversity & Inclusion**:
   - Represent diverse professionals
   - Avoid stereotypes
   - Show multiple paths to success

5. **Engagement**:
   - Use storytelling techniques
   - Create emotional investment
   - Include surprising or interesting details

---

## Content Reusability

Content can be reused across game types:

| Content | Bingo | Resource Mgmt | Decision Tree | Roleplay |
|---------|-------|---------------|---------------|----------|
| Career clues | ✅ Primary | ❌ | ❌ | ❌ |
| Resource events | ❌ | ✅ Primary | ✅ Adapted | ✅ Adapted |
| Decision nodes | ❌ | ❌ | ✅ Primary | ✅ Adapted |
| Scenario challenges | ❌ | ❌ | ❌ | ✅ Primary |

**Example**: A "supplier problem" resource event can be:
- A decision node choice in Decision Tree
- A challenge in Scenario Roleplay
- Not applicable to Bingo

---

## Next Steps

1. **Content Generation**: Use `CareerBingoClueGenerator` as template to build generators for each content type
2. **Migration**: Convert existing `dl_clues` to new `game_content` format
3. **Validation**: Build schema validators for each content type
4. **CMS**: Create content management interface for educators to add custom scenarios
