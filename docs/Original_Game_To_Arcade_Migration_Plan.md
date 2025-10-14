# Original Discovered Live! → Arcade Migration Plan

## 📋 Executive Summary

**Current State**: Discovered Live! is a **fully functional** single-player 5×5 bingo game that's the signature game for Pathfinity.

**Goal**: Integrate this as the **first arcade game** in the new modular arcade infrastructure without losing any existing functionality.

**Strategy**: Port the existing game to the new architecture while maintaining backward compatibility and setting the foundation for future games.

---

## 🎮 Current Game Analysis

### What Makes This Game Special

**"Discovered Live!"** is Pathfinity's flagship career exploration game with:

1. **5×5 Bingo Grid** - 25 career squares, center is user's career (FREE space)
2. **Skill-Based Clues** - 120 elementary career clues (24 careers × 5 clues each)
3. **Progressive Unlocking** - Answer clues correctly to unlock squares
4. **Bingo Detection** - 12 possible bingos (5 rows + 5 columns + 2 diagonals)
5. **XP & Streak System** - 10 XP per correct + 25 XP per bingo + streak bonuses
6. **Career Card Celebrations** - Visual progress shown only when new bingo achieved
7. **Journey Integration** - Unlocks after completing DISCOVER container

### Current Architecture

**Database Tables:**
- `dl_clues` - 120 elementary career clues
- `dl_games` - Game session tracking
- `dl_answers` - Answer analytics

**Service Layer:**
- `DiscoveredLiveService` - Complete game logic
  - Grid generation (5×5 with user career in center)
  - Intelligent clue selection
  - Answer validation
  - Bingo detection
  - XP calculation

**UI Components:**
- `DiscoveredLiveContainer` - Game flow orchestration
- `DiscoveredLiveIntro` - Welcome screen with grid preview
- `DiscoveredLiveQuestion` - Q&A with 4 multiple-choice options
- `DiscoveredLiveBingoGrid` - Career Card showing progress
- `DiscoveredLiveResults` - Final celebration and summary

**Content:**
- ✅ 24 elementary careers with 5 clues each = 120 total clues
- ⏳ Middle school careers (not yet created)
- ⏳ High school careers (not yet created)

---

## 🏗️ How It Fits Into Arcade Architecture

### Game Classification

**Discovered Live! = BINGO Mechanic + Career Content**

Using our new taxonomy:
- **Mechanic Code**: `bingo`
- **Game Code**: `career_bingo`
- **Content Source**: `careers`
- **Game Type**: Single-player pattern matching

### Arcade Entry

```json
{
  "game_code": "career_bingo",
  "display_name": "Discovered Live!",
  "description": "Turn your skills into career discoveries! Match clues to unlock your bingo card.",
  "icon": "🎯",
  "mechanic_code": "bingo",
  "content_source": "careers",
  "game_config": {
    "grid_size": {"rows": 5, "cols": 5},
    "win_conditions": ["row", "column", "diagonal"],
    "center_free_space": true,
    "user_career_in_center": true,
    "total_questions": 20,
    "time_per_question": null,
    "show_career_card_on_bingo": true
  },
  "grade_categories": ["elementary", "middle", "high"],
  "is_featured": true,
  "sort_order": 1
}
```

### Why This Works

1. **Preserves Uniqueness**: "Discovered Live!" remains the flagship name and brand
2. **Enables Variants**: Can easily add "Math Bingo", "Skill Bingo" using same engine
3. **Maintains Features**: All current features (Career Card, XP, streaks) stay intact
4. **Scales Content**: Middle/high school versions use same engine
5. **Journey Integration**: Unlock conditions remain the same

---

## 🔄 Migration Strategy

### Option 1: Dual-Mode Operation (RECOMMENDED)

**Keep both systems running during transition**

**Pros:**
- ✅ Zero downtime
- ✅ Test new system without risk
- ✅ Easy rollback if issues arise
- ✅ Gradual user migration

**Cons:**
- ❌ Two databases to maintain temporarily
- ❌ Slight code duplication

**Timeline:** 2-3 weeks

```
Week 1: Build BingoEngine + migrate schema
Week 2: Test with Career Bingo, maintain old system
Week 3: Switch users to new system, deprecate old
```

### Option 2: Complete Migration

**Replace old system entirely in one go**

**Pros:**
- ✅ Clean architecture immediately
- ✅ No duplicate code
- ✅ Forces complete testing

**Cons:**
- ❌ Higher risk
- ❌ Requires comprehensive testing upfront
- ❌ No rollback without restoring DB

**Timeline:** 3-4 weeks (more testing needed)

---

## 📊 Data Migration Plan

### Step 1: Schema Addition (No Breaking Changes)

```sql
-- Run new arcade tables (migration 040)
-- Old dl_* tables remain untouched

-- Result: Both systems coexist
```

### Step 2: Content Migration

```sql
-- Migrate dl_clues → game_content
INSERT INTO game_content (
  content_source,
  content_type,
  content_data,
  subject_id,
  difficulty,
  grade_category,
  tags,
  times_used,
  times_correct,
  is_active
)
SELECT
  'careers',
  'clue',
  jsonb_build_object(
    'subject_id', career_code,
    'subject_name', career_code, -- TODO: join with career_paths for name
    'prompt', clue_text,
    'answer', career_code, -- TODO: get display name
    'skill_connection', skill_connection,
    'distractors', distractor_careers,
    'hint', null,
    'imageUrl', null
  ),
  career_code,
  difficulty,
  grade_category,
  ARRAY[skill_connection],
  times_shown,
  times_correct,
  is_active
FROM dl_clues
WHERE is_active = true;
```

### Step 3: Historical Data Migration (Optional)

```sql
-- Migrate dl_games → game_sessions
-- Migrate dl_answers → game_interactions
-- Only if we need to preserve history
```

### Step 4: Deprecation

```sql
-- After 30 days of successful operation:
-- Rename old tables to dl_clues_deprecated
-- Drop after 90 days
```

---

## 🛠️ Implementation Tasks

### Phase 1: Foundation (Week 1)

**1.1 Run Arcade Schema**
- [ ] Run `040_arcade_infrastructure.sql`
- [ ] Verify all tables created
- [ ] Test RLS policies

**1.2 Build BingoEngine**
```typescript
class BingoEngine extends GameEngine {
  initializeGame(config, content) {
    // Generate 5×5 grid
    // Place user career in center
    // Select 24 unique careers
  }

  processInteraction(state, interaction) {
    // Validate answer
    // Unlock square if correct
    // Check for bingos
    // Calculate XP
  }

  checkWinCondition(state) {
    // Check rows, columns, diagonals
    // Return new bingos achieved
  }
}
```

**1.3 Migrate Content**
- [ ] Run content migration SQL
- [ ] Verify all 120 clues migrated
- [ ] Test content retrieval

### Phase 2: Service Integration (Week 2)

**2.1 Create Adapter Service**
```typescript
class DiscoveredLiveBingoService {
  private engine: BingoEngine;
  private arcadeService: DiscoveredLiveArcadeService;

  // Maintains same interface as old DiscoveredLiveService
  async initializeGame(options) {
    return this.arcadeService.startGame('career_bingo', ...);
  }

  async getNextQuestion(gameId) {
    return this.arcadeService.getNextContent(gameId);
  }

  async submitAnswer(submission) {
    return this.arcadeService.submitInteraction(gameId, ...);
  }
}
```

**2.2 Update Components**
- [ ] Update `DiscoveredLiveContainer` to use adapter
- [ ] Test all game flows
- [ ] Verify Career Card timing
- [ ] Verify XP calculations

**2.3 Feature Parity Testing**
- [ ] 5×5 grid generation
- [ ] User career in center
- [ ] Clue selection logic
- [ ] Answer validation
- [ ] Bingo detection (all 12 lines)
- [ ] XP calculation (base + bingo + streak)
- [ ] Career Card on bingo only
- [ ] Results screen
- [ ] Journey integration

### Phase 3: Cutover (Week 3)

**3.1 A/B Testing (Optional)**
- [ ] 10% of users on new system
- [ ] Monitor error rates
- [ ] Compare performance metrics
- [ ] Increase to 50%, then 100%

**3.2 Full Migration**
- [ ] Switch all users to new system
- [ ] Monitor for 24 hours
- [ ] Keep old system as backup

**3.3 Deprecation**
- [ ] Mark old tables as deprecated
- [ ] Update documentation
- [ ] Plan removal date

---

## 🎯 Preserving Unique Features

### Feature: Career Card (Only on New Bingo)

**Current Behavior**: Show `DiscoveredLiveBingoGrid` only when NEW bingo achieved

**Arcade Implementation**:
```typescript
// In BingoEngine.processInteraction()
const result = {
  isCorrect: true,
  unlockedPosition: {row: 2, col: 3},
  newAchievements: [
    {type: 'bingo_line', description: 'Row 2', xpBonus: 25}
  ]
};

// In DiscoveredLiveContainer
if (result.newAchievements.length > 0) {
  setCurrentScreen('bingo-grid'); // Show Career Card
}
```

### Feature: User Career in Center

**Current Behavior**: User's career always at (2,2) as FREE space

**Arcade Implementation**:
```typescript
// In BingoEngine.initializeGame()
if (config.user_career_in_center && userCareerCode) {
  grid[2][2] = userCareerCode;
  initialUnlockedSquares.push({row: 2, col: 2});
}
```

### Feature: Journey Integration

**Current Behavior**: Unlocks after 4 discovery stations complete

**Arcade Implementation**:
```typescript
// In arcade_games table
{
  "unlock_requirements": {
    "journey_containers_complete": ["learn", "experience", "discover"],
    "min_containers_complete": 4
  }
}

// In ArcadeService.canPlayGame()
const canPlay = await checkUnlockRequirements(
  studentId,
  game.unlockRequirements
);
```

---

## 🚀 Benefits of Migration

### For Discovered Live!

1. **Future-Proof**: Ready for middle/high school variants
2. **Multiplayer-Ready**: Architecture supports live rooms
3. **Cross-Game Features**: Leaderboards, achievements work across all games
4. **AI Content Generation**: Easy to generate more clues
5. **Performance**: Optimized queries and caching

### For The Arcade

1. **Proven Game**: Launch arcade with a working, tested game
2. **Bingo Engine**: Reuse for Math Bingo, Skill Bingo, etc.
3. **Content Pool**: 120 career clues available for other games
4. **Design Patterns**: Establishes UI/UX patterns for other games
5. **User Validation**: Real users proving the arcade works

---

## 📈 Expansion Opportunities

### After Migration

**Same Engine, New Content:**
- **Math Bingo**: Use bingo engine + math problems
- **Skill Bingo**: Use bingo engine + skill descriptions
- **Industry Bingo**: Use bingo engine + industry info

**Same Content, New Engines:**
- **Career Speed Match**: careers + speed_challenge engine
- **Career Path Explorer**: careers + decision_tree engine
- **Day in the Life**: careers + scenario_roleplay engine

**Evolution:**
- **Multiplayer Rooms**: Add real-time competitive play
- **Tournament Mode**: Weekly competitions
- **Team Play**: Cooperative bingo

---

## ⚠️ Risks & Mitigation

### Risk 1: Feature Loss During Migration

**Mitigation**:
- Comprehensive feature checklist
- Side-by-side testing (old vs. new)
- User acceptance testing before cutover

### Risk 2: Performance Regression

**Mitigation**:
- Load testing with arcade schema
- Query performance benchmarks
- Rollback plan ready

### Risk 3: User Confusion

**Mitigation**:
- No UI changes (same components)
- Same game flow
- Same branding ("Discovered Live!")

### Risk 4: Data Loss

**Mitigation**:
- Keep old tables during transition
- Daily backups before cutover
- Ability to revert migration

---

## ✅ Success Criteria

### Technical

- [ ] All 120 clues migrated successfully
- [ ] Zero data loss
- [ ] Same or better performance
- [ ] All features working identically
- [ ] No regression bugs

### User Experience

- [ ] Same game flow
- [ ] Same visual design
- [ ] Same or better load times
- [ ] Career Card timing unchanged
- [ ] XP calculations identical

### Business

- [ ] Game completion rate ≥ current
- [ ] User engagement time ≥ current
- [ ] Zero increase in support tickets
- [ ] Foundation for arcade expansion

---

## 📅 Recommended Timeline

### Week 1: Foundation
- **Days 1-2**: Run arcade schema, build BingoEngine skeleton
- **Days 3-4**: Implement grid generation and bingo detection
- **Day 5**: Test BingoEngine with mock data

### Week 2: Integration
- **Days 1-2**: Migrate content, create adapter service
- **Days 3-4**: Update DiscoveredLiveContainer to use new system
- **Day 5**: Full integration testing

### Week 3: Testing & Cutover
- **Days 1-2**: User acceptance testing
- **Days 3-4**: A/B testing with small user group
- **Day 5**: Full cutover, monitor closely

### Week 4: Stabilization
- **Days 1-3**: Monitor, fix any issues
- **Days 4-5**: Deprecate old system, update docs

**Total**: 4 weeks to full migration

---

## 🎯 Decision Point

### Questions for You:

1. **Migration Approach**: Dual-mode (safer, slower) vs. Complete migration (faster, riskier)?

2. **Historical Data**: Migrate old game sessions or start fresh with new system?

3. **Timing**: Start migration now or wait for specific milestone?

4. **Feature Adds**: Any new features to add during migration (e.g., power-ups, time limits)?

5. **Content Expansion**: Generate middle/high school clues before or after migration?

---

## 💡 Recommendation

**My Recommendation**: **Dual-Mode Operation**

**Why:**
1. ✅ Discovered Live! is your **signature game** - zero-risk migration essential
2. ✅ Gives time to thoroughly test arcade infrastructure
3. ✅ Users never experience downtime or bugs
4. ✅ Easy to add middle/high school content after migration
5. ✅ Sets precedent for migrating future games

**Next Steps:**
1. Run arcade schema (migration 040)
2. Build BingoEngine class
3. Migrate 120 clues to game_content table
4. Create adapter service maintaining current interface
5. Test with small user group
6. Full cutover after validation

**ETA**: Production-ready in 3-4 weeks

---

## 📚 Related Documents

- **Current Game**: `Discovered_Live_Implementation_Status.md`
- **New Architecture**: `Discovered_Live_Arcade_Architecture.md`
- **Content Schemas**: `Arcade_Game_Content_Schemas.md`
- **Database Schema**: `database/migrations/040_arcade_infrastructure.sql`
- **Type Definitions**: `src/types/ArcadeGameTypes.ts`

---

**Ready to proceed?** The infrastructure is built and ready. Discovered Live! can become the first game in a world-class educational arcade! 🎮
