# Career Challenge: Component Reusability Mapping

## Executive Summary
This document maps existing DLCC components to the new Executive Decision Maker game, showing exactly what can be reused, what needs modification, and what's new.

**Overall Reusability: 68% of existing code can be reused or modified**

---

## 🟢 DIRECTLY REUSABLE (No Changes Needed) - 35%

### Services & Infrastructure

| Existing Component | Location | Usage in New Game | Reuse % |
|-------------------|----------|-------------------|----------|
| **supabase client** | `/lib/supabase.ts` | Database connections, real-time subscriptions | 100% |
| **CareerChallengeSoundManager** | `/services/CareerChallengeSoundManager.ts` | All sound effects and music | 100% |
| **SoundSettings** | `/components/career-challenge/SoundSettings.tsx` | Sound preference UI | 100% |
| **TutorialOverlay** | `/components/career-challenge/TutorialOverlay.tsx` | Tutorial system structure | 100% |
| **Authentication** | Existing auth system | Player login/registration | 100% |
| **Error Handling** | Existing error boundaries | Error management | 100% |

### Database Tables

| Existing Table | Usage in New Game | Reuse % |
|----------------|-------------------|----------|
| **users** | Player accounts | 100% |
| **cc_industries** | Industry definitions | 100% |
| **cc_game_sessions** | Session management | 100% |
| **cc_game_session_players** | Player tracking | 100% |

---

## 🟡 REUSABLE WITH MODIFICATIONS - 33%

### Major Components Requiring Updates

#### **CareerChallengeHub.tsx** → **ExecutiveDecisionHub.tsx**
```typescript
// Existing (680 lines)
export const CareerChallengeHub: React.FC<CareerChallengeHubProps> = ({
  playerId,
  playerName,
  onBack,
  onStartGame
})

// Modified for new game (estimated 750 lines)
// REUSE:
- Industry selection UI structure (lines 279-357)
- Room browser interface (lines 359-464)
- Navigation structure
- Animation patterns

// MODIFY:
- Replace "industries" with "company rooms"
- Add scenario type filters (Crisis/Risk/Opportunity)
- Add company branding to room cards
- Show current scenario preview

// REUSE PERCENTAGE: 75%
```

#### **GameLobby.tsx** → **CompanyLobby.tsx**
```typescript
// Existing (357 lines)
export const GameLobby: React.FC<GameLobbyProps> = ({
  sessionId,
  roomCode,
  hostId,
  currentPlayerId,
  industryName,
  maxPlayers,
  minPlayers,
  players,
  onStartGame,
  onPlayerReady
})

// Modified for new game (estimated 400 lines)
// REUSE:
- Player ready system (lines 88-111)
- Room code display (lines 157-189)
- Player list (lines 191-257)
- Countdown system (lines 113-142)
- Real-time sync (lines 54-80)

// ADD:
- Company theme display
- Scenario type selection (for practice modes)
- Difficulty settings

// REUSE PERCENTAGE: 85%
```

#### **CareerChallengeService.ts** → Extended
```typescript
// Existing (350+ lines estimated)
class CareerChallengeService {
  async createSession(hostPlayerId, industryId, roomCode, hostDisplayName)
  async joinSession(sessionId, playerId)
  async getActiveSessions()
  async getIndustries()
}

// Extended for new game (estimated 500 lines)
// REUSE:
- All existing methods unchanged
- Database connection patterns
- Error handling

// ADD:
+ async getCompanyRooms()
+ async getScenariosByCompany(companyId)
+ async trackLeadershipScores(playerId, scores)
+ async getPlayerProgression(playerId)

// REUSE PERCENTAGE: 70%
```

#### **CareerChallengeGameEngine.ts** → Extended
```typescript
// Existing (complex state management)
class CareerChallengeGameEngine {
  constructor(supabaseClient)
  async joinGameSession(sessionId, playerId, displayName)
  async startGame()
  async selectChallenge(playerId, challengeId)
  async submitTeam(playerId, roleCardIds)
}

// Extended for new game
// REUSE:
- Session management
- Player state tracking
- Turn management
- Real-time broadcasting
- Score tracking

// MODIFY:
- selectChallenge() → selectExecutive()
- submitTeam() → submitSolutions()
- Add lens effect application
- Add 6 C's calculation

// ADD:
+ applyLensEffect(solution, executive)
+ calculateLeadershipScore(selections)
+ revealSolutions()

// REUSE PERCENTAGE: 65%
```

#### **EnhancedGameRoom.tsx** → ExecutiveGameRoom.tsx
```typescript
// Existing (720 lines)
// This is the main game container

// Modified for new game (estimated 900 lines)
// REUSE:
- Header structure (lines 587-624)
- Error handling (lines 627-644)
- Connection status (lines 607-616)
- Victory screen integration (lines 671-678)
- Multiplayer sync integration (lines 682-714)

// REPLACE:
- Game board layout (lines 354-582) - New phase-based layout
- Turn phases - New 5-phase structure
- Challenge selection → Executive selection
- Team building → Solution selection

// REUSE PERCENTAGE: 40%
```

### UI Components

| Component | Current Use | New Use | Modifications | Reuse % |
|-----------|------------|---------|---------------|---------|
| **VictoryScreen.tsx** | Show winner | Show winner + 6 C's report | Add leadership display section | 70% |
| **MultiplayerSync.tsx** | Sync game state | Sync game state | Add new event types | 85% |
| **TutorialOverlay.tsx** | Tutorial system | Tutorial system | New content only | 90% |
| **ChallengeSelectionPanel.tsx** | Select challenges | Display scenario | Major restructure | 20% |
| **TeamBuildingPanel.tsx** | Select role cards | Select solutions | Major restructure | 25% |

---

## 🔴 NEW COMPONENTS REQUIRED - 32%

### Completely New Services

```typescript
// LensEffectEngine.ts (NEW - ~200 lines)
class LensEffectEngine {
  applyLens(solution: Solution, executive: CSuiteRole): LensedSolution
  calculateLensMultiplier(executive: CSuiteRole, optimalRole: CSuiteRole): number
  generateLensDescription(solution: Solution, executive: CSuiteRole): string
  getCMOLens(solution: Solution): LensEffect
  getCFOLens(solution: Solution): LensEffect
  getCHROLens(solution: Solution): LensEffect
  getCOOLens(solution: Solution): LensEffect
  getCTOLens(solution: Solution): LensEffect
}

// LeadershipAnalyzer.ts (NEW - ~250 lines)
class LeadershipAnalyzer {
  analyze6Cs(selections: Solution[], executive: CSuiteRole): SixCsReport
  calculateCharacterScore(selections: Solution[]): number
  calculateCompetenceScore(selections: Solution[], executive: CSuiteRole): number
  calculateCommunicationScore(selections: Solution[]): number
  calculateCompassionScore(selections: Solution[]): number
  calculateCommitmentScore(selections: Solution[]): number
  calculateConfidenceScore(timing: number, consistency: boolean): number
  generateInsights(report: SixCsReport): LeadershipInsight[]
  getCareerRecommendations(historicalReports: SixCsReport[]): CareerPath[]
}

// ScenarioManager.ts (NEW - ~150 lines)
class ScenarioManager {
  getScenarioByType(company: Company, type: ScenarioType): Scenario
  adaptScenarioToIndustry(baseScenario: Scenario, industry: Industry): Scenario
  getExecutivePitches(scenario: Scenario): ExecutivePitch[]
  validateSolutions(selected: Solution[], perfect: Solution[]): ValidationResult
}
```

### Completely New UI Components

```typescript
// ExecutiveSelector.tsx (NEW - ~300 lines)
interface ExecutiveSelectorProps {
  scenario: Scenario
  onSelectExecutive: (role: CSuiteRole) => void
  timeRemaining: number
}
// Shows 5 C-Suite executives with speech bubbles
// Animated selection with timer
// Executive argument displays

// SolutionSelectionPanel.tsx (NEW - ~400 lines)
interface SolutionSelectionPanelProps {
  solutions: Solution[]
  selectedExecutive: CSuiteRole
  onSelectSolutions: (solutionIds: string[]) => void
}
// Displays 10 solution cards with lens effects applied
// Drag-and-drop or click to select 5
// Visual bias indicators based on executive

// SolutionRevealPanel.tsx (NEW - ~250 lines)
interface SolutionRevealPanelProps {
  playerSelections: Solution[]
  perfectSolutions: Solution[]
  executive: CSuiteRole
}
// Side-by-side comparison
// Scoring breakdown
// Educational explanations

// LeadershipReportCard.tsx (NEW - ~350 lines)
interface LeadershipReportCardProps {
  sixCsScores: SixCsReport
  realWorldExample: string
  careerInsights: CareerInsight[]
}
// 6 C's visualization with stars
// Detailed feedback per C
// Career recommendations
// Historical progression

// CompanyRoomSelector.tsx (NEW - ~300 lines)
interface CompanyRoomSelectorProps {
  companies: CompanyRoom[]
  onSelectRoom: (roomId: string) => void
}
// 10 company cards with branding
// Player counts
// Current scenario preview
// Industry filtering
```

---

## Implementation Efficiency Analysis

### Code Reuse by Category

| Category | Lines of Code (Estimated) | Reused | Modified | New | Reuse % |
|----------|---------------------------|---------|----------|-----|---------|
| **Services** | 1,500 | 800 | 400 | 300 | 80% |
| **Game Engine** | 800 | 520 | 180 | 100 | 78% |
| **UI Components** | 3,000 | 1,050 | 750 | 1,200 | 60% |
| **Database** | 500 | 350 | 100 | 50 | 90% |
| **Types/Interfaces** | 400 | 200 | 100 | 100 | 75% |
| **Utilities** | 300 | 300 | 0 | 0 | 100% |
| **Total** | **6,500** | **3,220** | **1,530** | **1,750** | **73%** |

### Time Savings Analysis

| Component | From Scratch (Days) | With Reuse (Days) | Time Saved |
|-----------|-------------------|-------------------|------------|
| Infrastructure Setup | 5 | 1 | 4 days |
| Game Engine | 10 | 4 | 6 days |
| UI Components | 15 | 8 | 7 days |
| Multiplayer System | 8 | 2 | 6 days |
| Database Schema | 3 | 1 | 2 days |
| Testing Framework | 5 | 2 | 3 days |
| **Total** | **46 days** | **18 days** | **28 days (61%)** |

---

## Specific Reuse Mapping for New Features

### Phase-by-Phase Component Usage

#### **Phase 1: Scenario Alert**
- Reuse: Animation patterns from ChallengeSelectionPanel
- Reuse: Timer component from GameLobby
- New: Scenario type indicators, 6 P's badges

#### **Phase 2: Executive Selection**
- Reuse: Selection mechanics from role card selection
- Reuse: Timer system from turn timer
- New: Executive pitch bubbles, argument display

#### **Phase 3: Solution Selection**
- Reuse: Card selection UI from TeamBuildingPanel (structure only)
- Reuse: Drag-and-drop patterns
- New: Lens effect overlays, bias indicators

#### **Phase 4: Solution Reveal**
- Reuse: Result display patterns from challenge results
- Reuse: Animation sequences
- New: Comparison visualization, perfect solution explanations

#### **Phase 5: Leadership Analysis**
- Reuse: Victory screen structure
- Reuse: Score display components
- New: 6 C's visualization, career insights

---

## Database Table Reuse

### Existing Tables - Reused As-Is
```sql
-- These require NO changes
users
cc_industries (becomes industry context for companies)
```

### Existing Tables - Minor Modifications
```sql
-- cc_game_sessions - ADD columns:
ALTER TABLE cc_game_sessions ADD COLUMN scenario_id UUID;
ALTER TABLE cc_game_sessions ADD COLUMN scenario_type VARCHAR(50);
ALTER TABLE cc_game_sessions ADD COLUMN company_room_id UUID;

-- cc_game_session_players - ADD columns:
ALTER TABLE cc_game_session_players ADD COLUMN selected_executive VARCHAR(50);
ALTER TABLE cc_game_session_players ADD COLUMN leadership_scores JSONB;
ALTER TABLE cc_game_session_players ADD COLUMN solution_selections UUID[];
```

### New Tables Required
```sql
-- Completely new tables
cc_business_scenarios
cc_solution_cards
cc_lens_effects
cc_leadership_scores
cc_player_progression
cc_company_rooms
```

---

## Risk Areas for Reusability

### High Risk (May need more rework than expected)
1. **EnhancedGameRoom.tsx** - Game flow is significantly different
2. **Turn phase management** - New 5-phase structure vs current 2-phase

### Medium Risk
1. **Challenge/Scenario display** - Different information architecture
2. **Scoring system** - More complex with lens multipliers

### Low Risk (Straightforward reuse)
1. **Multiplayer infrastructure** - Same patterns apply
2. **Database connections** - Proven patterns
3. **Authentication** - No changes needed

---

## Recommendations for Maximum Reuse

1. **Keep existing DLCC operational** - Don't modify original files, extend them
2. **Use composition over modification** - Wrap existing components rather than rewrite
3. **Leverage existing patterns** - Copy animation, state management patterns
4. **Maintain same file structure** - Easier to identify reusable pieces
5. **Create adapter layers** - Transform old data structures to new ones

### Example Adapter Pattern
```typescript
// Instead of rewriting CareerChallengeService
class ExecutiveDecisionService extends CareerChallengeService {
  // Inherit all existing methods

  // Add new methods
  async getCompanyRooms() { }

  // Override only what's different
  async createSession(hostPlayerId, companyRoomId, roomCode, hostDisplayName) {
    // Transform to use company instead of industry
    const industryId = await this.getIndustryFromCompany(companyRoomId);
    return super.createSession(hostPlayerId, industryId, roomCode, hostDisplayName);
  }
}
```

---

## Conclusion

By leveraging **73% code reuse**, we can reduce development time from 46 days to 18 days. The existing DLCC infrastructure provides a solid foundation for:
- Multiplayer room management
- Real-time synchronization
- Player state management
- UI component patterns
- Database operations

The main new development focuses on:
- Lens effect system (completely new)
- 6 C's analysis (completely new)
- 5-phase game flow (restructured)
- Solution selection mechanics (modified)

This reusability mapping ensures we're not rebuilding what already works while focusing resources on the innovative new features that differentiate the Executive Decision Maker game.