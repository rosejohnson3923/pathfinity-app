# Discovered Live! Arcade - Modular Architecture Design

## 🎯 Executive Summary

We've designed a **mechanic-based arcade system** that allows you to build multiple educational games using shared infrastructure. Instead of creating separate systems for each game, we have:

- **4 reusable game engines** (Bingo, Resource Management, Decision Tree, Scenario Roleplay)
- **Unified database schema** with flexible JSONB columns
- **Shared service layer** for XP, achievements, and leaderboards
- **Content reusability** across game types

---

## 🎮 Priority Game Types

### 1. **BINGO** - Pattern Recognition & Matching
**Example**: Career Detective Bingo, Math Bingo, Vocabulary Bingo
- **Mechanic**: Match clues to subjects on a 5×5 grid
- **Win Condition**: Complete rows, columns, or diagonals
- **Educational Value**: Quick recall, pattern recognition, subject mastery

### 2. **RESOURCE_MANAGEMENT** - Strategic Decision-Making
**Example**: Career Budget Challenge, Business Manager, Time Allocator
- **Mechanic**: Manage limited resources (time, money, energy) across multiple rounds
- **Win Condition**: Maintain resources above threshold while maximizing reputation
- **Educational Value**: Trade-offs, prioritization, real-world decision-making

### 3. **DECISION_TREE** - Critical Thinking & Consequences
**Example**: Career Path Explorer, Life Choices, Industry Navigator
- **Mechanic**: Branching narrative where choices affect future options
- **Win Condition**: Navigate to a successful career outcome
- **Educational Value**: Cause-and-effect, long-term thinking, exploring possibilities

### 4. **SCENARIO_ROLEPLAY** - Immersive Career Experience
**Example**: Day in the Life, Crisis Response, Professional Simulator
- **Mechanic**: Handle realistic career challenges in sequence
- **Win Condition**: Maintain high performance scores across all metrics
- **Educational Value**: Applied skills, professional judgment, situational awareness

---

## 📊 Database Schema Overview

### Core Tables

```
game_mechanic_types
├── Defines base mechanics (how games work)
└── Stores scoring rules and configuration schemas

arcade_games
├── Specific game instances (mechanic + content theme)
├── Links: game_mechanic_types
└── Example: "Career Bingo" = bingo mechanic + career content

game_content
├── Universal content pool for ALL games
├── Flexible content_data JSONB (different per content_type)
└── Reusable across multiple games

game_sessions
├── Tracks individual gameplay sessions
├── Links: arcade_games, game_mechanic_types
└── Flexible game_state JSONB (different per mechanic)

game_interactions
├── Records player actions and responses
├── Links: game_sessions, game_content
└── Flexible interaction_data JSONB (different per mechanic)

game_leaderboards
├── Cross-game rankings and statistics
└── Can rank by game, mechanic, or all games combined
```

### Key Design Decisions

**✅ Why JSONB?**
- Each game type has unique state (bingo grid vs. resource pools vs. decision paths)
- Avoids creating 20+ tables as we add more games
- Maintains type safety through TypeScript interfaces
- Easy to evolve game mechanics without schema migrations

**✅ Why separate game_mechanic_types and arcade_games?**
- **Mechanic** = HOW you play (bingo pattern matching)
- **Game** = WHAT you play (careers vs. math vs. vocabulary)
- Example: One bingo engine powers Career Bingo, Math Bingo, Skill Bingo

---

## 🛠️ Service Architecture

### Base Class Pattern

```typescript
// Base engine with shared logic
abstract class GameEngine {
  abstract initializeGame(config, content): GameState;
  abstract processInteraction(state, data): InteractionResult;
  abstract checkWinCondition(state): boolean;
  abstract calculateScore(interaction): number;
}

// Specific engines
class BingoEngine extends GameEngine { ... }
class ResourceManagementEngine extends GameEngine { ... }
class DecisionTreeEngine extends GameEngine { ... }
class ScenarioRoleplayEngine extends GameEngine { ... }
```

### Unified Service

```typescript
class DiscoveredLiveArcadeService {
  private engines: Map<string, GameEngine>;

  async startGame(gameCode, studentId)
  async getNextContent(sessionId)
  async submitInteraction(sessionId, interaction)
  async completeSession(sessionId)
  async getLeaderboard(gameCode, type)
}
```

**Benefits**:
- Single service manages all game types
- Shared logic for XP calculation, achievements, leaderboards
- Easy to add new games - just register a new engine

---

## 📝 Content Schema Examples

### BINGO Clue
```json
{
  "subject_id": "chef",
  "subject_name": "Chef",
  "prompt": "I prepare delicious meals in restaurants",
  "answer": "Chef",
  "skill_connection": "Food preparation and culinary arts",
  "distractors": ["Waiter", "Farmer", "Nutritionist"]
}
```

### RESOURCE_MANAGEMENT Event
```json
{
  "event_title": "Rush Order Request",
  "career_situation": "A VIP customer offers to pay double for 20 meals tonight",
  "options": [
    {
      "label": "Accept the order",
      "resource_changes": {"time": -8, "money": +200, "energy": -15},
      "is_optimal": true,
      "feedback": "Great choice! Taking calculated risks leads to growth."
    },
    ...
  ]
}
```

### DECISION_TREE Node
```json
{
  "situation_title": "Starting Your Culinary Journey",
  "decision_prompt": "What path will you choose?",
  "choices": [
    {
      "label": "Attend Culinary School",
      "leads_to_node": "chef_school_experience_01",
      "skill_gained": ["knife_skills", "french_technique"],
      "career_impact": {
        "timeline": "+2 years",
        "opportunities_opened": ["fine_dining", "hotel_chains"],
        "opportunities_closed": []
      },
      "mentor_advice": "Formal training opens doors to prestigious kitchens."
    },
    ...
  ]
}
```

### SCENARIO_ROLEPLAY Challenge
```json
{
  "challenge_title": "Supplier Problem",
  "description": "Fish delivery truck broke down, lunch service in 3 hours",
  "options": [
    {
      "action": "Call backup supplier immediately",
      "is_correct": true,
      "is_professional": true,
      "performance_scores": {
        "professionalism": 95,
        "efficiency": 90,
        "problem_solving": 95,
        "teamwork": 80
      },
      "mentor_feedback": "Excellent! Having backup suppliers is professional management.",
      "industry_insight": "Top chefs maintain relationships with multiple vendors."
    },
    ...
  ]
}
```

---

## 🎲 Game Flow Examples

### BINGO Flow
1. System generates 5×5 grid from careers in database
2. User's career goes in center (FREE space)
3. Present clue: "I prepare delicious meals"
4. Show 4 options (1 correct + 3 distractors from grid)
5. User selects answer
6. If correct: unlock square, check for bingo lines
7. Award XP (10 base + 50 bonus per bingo)
8. Repeat for 20 questions

### RESOURCE_MANAGEMENT Flow
1. Player starts with: Time=40hrs, Money=$1000, Energy=100pts
2. Present career scenario with 3-4 options
3. Each option has different resource costs/gains
4. Player chooses based on strategy
5. Update resources, show consequences
6. If any resource hits 0 → game over
7. Complete 10 rounds successfully to win

### DECISION_TREE Flow
1. Start at root node: "You just graduated high school..."
2. Present 3 career path choices
3. Each choice leads to different node
4. Track skills acquired and opportunities unlocked/closed
5. Continue branching for 5 levels
6. Reach leaf node showing career outcome
7. Award XP based on skills gained and optimal decisions

### SCENARIO_ROLEPLAY Flow
1. Set the scene: "6 AM at Bella Vista Restaurant, you're the sous chef..."
2. Present 8 sequential challenges
3. Each challenge has realistic options
4. Track performance metrics: professionalism, efficiency, problem-solving, teamwork
5. Provide immediate feedback with industry insights
6. Must maintain 70+ scores to succeed
7. Award XP for professional decisions

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Current)
- ✅ Database schema designed
- ✅ Migration file created
- ✅ TypeScript types defined
- ✅ Content schemas documented

### Phase 2: Bingo Migration (Next)
- 🔄 Build BingoEngine class
- 🔄 Migrate existing Career Bingo to new system
- 🔄 Test with existing dl_clues data
- 🔄 Update MultiplayerGameRoom component

### Phase 3: Resource Management
- Build ResourceManagementEngine
- Create Career Budget Challenge game
- Generate resource event content
- Build ResourceManagementBoard UI component

### Phase 4: Decision Tree
- Build DecisionTreeEngine
- Create Career Path Explorer game
- Generate decision tree content
- Build DecisionTreeBoard UI component

### Phase 5: Scenario Roleplay
- Build ScenarioRoleplayEngine
- Create Day in the Life game
- Generate scenario content
- Build ScenarioRoleplayBoard UI component

### Phase 6: Expansion
- Add more games using existing engines
- Math Bingo (bingo engine + math content)
- Skill Bingo (bingo engine + skill content)
- Business Manager (resource_management engine)
- Industry Navigator (decision_tree engine)

---

## 💡 Key Advantages

### 1. **Rapid Game Development**
Once engines are built, adding a new game is:
1. Insert row into `arcade_games` table
2. Generate content using AI service
3. That's it - no new code needed!

### 2. **Content Reusability**
- Same career clues work in multiple games
- Resource events can become decision nodes
- Scenarios can be adapted across game types

### 3. **Unified Player Experience**
- One XP system across all games
- Shared leaderboards (who's the best overall?)
- Cross-game achievements
- Consistent UI/UX patterns

### 4. **Easy Maintenance**
- Fix a bug once in BingoEngine → fixes all bingo-style games
- Update scoring logic in one place
- Shared analytics and reporting

### 5. **Scalable Architecture**
- Add 10 more games without database changes
- Support new mechanics by adding new engines
- Content generation scales with AI

---

## 📚 Files Created

### Database
1. **`database/migrations/040_arcade_infrastructure.sql`**
   - Complete schema for modular arcade system
   - Includes all tables, indexes, RLS policies, functions

### Documentation
2. **`docs/Arcade_Game_Content_Schemas.md`**
   - Detailed JSONB structure for each game type
   - Real examples for all 4 mechanics
   - Content generation guidelines

3. **`docs/Discovered_Live_Arcade_Architecture.md`** (this file)
   - Complete architecture overview
   - Design decisions and rationale
   - Implementation roadmap

### Code
4. **`src/types/ArcadeGameTypes.ts`**
   - TypeScript interfaces for all game types
   - Content schemas, game states, interactions
   - Service request/response types

5. **`src/services/CareerBingoClueGenerator.ts`** (already exists)
   - AI-powered clue generation
   - Grade-appropriate language
   - Ready to extend for other content types

---

## 🤔 Next Steps & Decisions Needed

### Immediate Action Items

1. **Run Migration**
   ```bash
   # Apply the new schema
   psql -d pathfinity -f database/migrations/040_arcade_infrastructure.sql
   ```

2. **Migrate Existing Data**
   ```sql
   -- Convert dl_clues to game_content
   INSERT INTO game_content (content_source, content_type, content_data, ...)
   SELECT 'careers', 'clue', jsonb_build_object(...), ...
   FROM dl_clues;
   ```

3. **Build BingoEngine**
   - Start with existing DiscoveredLiveService logic
   - Refactor into BingoEngine class
   - Test with Career Bingo

### Questions for You

1. **Migration Timing**: When should we run the migration?
   - Run now and migrate Career Bingo immediately?
   - Or run in staging first for testing?

2. **Legacy Tables**: After migration, should we:
   - Keep `dl_*` tables for rollback safety?
   - Drop them immediately?
   - Create views for backward compatibility?

3. **Content Generation**: Should I build AI generators for:
   - Resource events?
   - Decision tree nodes?
   - Scenario challenges?
   - (Use CareerBingoClueGenerator as template)

4. **UI Priority**: Which game should we build first after Bingo?
   - Resource Management (career budget challenge)?
   - Decision Tree (career path explorer)?
   - Scenario Roleplay (day in the life)?

---

## ✅ Summary

We've created a **professional, scalable arcade infrastructure** that:

- ✅ Supports 4 game mechanics out of the box
- ✅ Uses flexible JSONB for game-specific data
- ✅ Shares common logic (XP, achievements, leaderboards)
- ✅ Allows rapid addition of new games
- ✅ Maintains type safety through TypeScript
- ✅ Ready for AI-powered content generation
- ✅ Designed for long-term maintainability

**This architecture will save you months of development time as you expand Discovered Live! into a full arcade of educational games.**

Ready to proceed with implementation? Let me know which piece you'd like to tackle first!
