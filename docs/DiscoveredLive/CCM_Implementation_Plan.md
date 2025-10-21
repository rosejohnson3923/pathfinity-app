# Career Challenge Multiplayer - Implementation Plan
**Phase-by-Phase Roadmap to Simultaneous Multiplayer**
**Created:** October 19, 2025

---

## Executive Summary

This document outlines the implementation plan to transform the CCM prototype from **turn-based** to **simultaneous multiplayer** gameplay, leveraging existing reusable components and infrastructure.

**Current State:** Turn-based prototype with basic UI and database schema
**Target State:** Real-time simultaneous multiplayer with circular table layout
**Timeline:** 3 phases over 3-4 weeks

---

## Existing Reusable Components & Infrastructure

### ✅ Database Schema (Complete)
**Location:** `supabase/migrations/20251016_*_ccm_*.sql`

**Tables Ready:**
- `ccm_perpetual_rooms` - 4 rooms seeded
- `ccm_challenge_cards` - 30 challenges seeded
- `ccm_role_cards` - 50 roles seeded (needs 10 COO roles added)
- `ccm_synergy_cards` - 5 synergies seeded (needs name updates)
- `ccm_game_sessions` - Game state management
- `ccm_session_participants` - Player tracking
- `ccm_round_submissions` - Score tracking
- `ccm_leaderboard` - Rankings

**Reusability:** 95% ready, needs minor content updates

---

### ✅ Backend Services (Mostly Complete)
**Location:** `src/services/`

**1. CCMService.ts**
- Database CRUD operations
- Game session management
- Player management
- **Reusability:** 90% - core functions work, needs lens multiplier scoring

**2. CCMGameEngine.ts**
- Round management
- Score calculation logic
- Timer management
- **Reusability:** 60% - needs refactor for simultaneous gameplay

**3. CCMRealtimeService.ts**
- Supabase real-time channels
- Broadcast events (player_joined, round_started, etc.)
- Presence tracking
- **Reusability:** 80% - real-time infrastructure ready

**4. CCMOrchestrator.ts**
- Coordinates game flow
- Phase transitions
- **Reusability:** 50% - needs major refactor from turn-based to simultaneous

**5. CCMAIPlayerService.ts**
- AI bot opponents
- **Reusability:** 70% - needs update for simultaneous timing

---

### ✅ API Endpoints (Complete)
**Location:** `src/pages/api/ccm/`

**Ready to Use:**
- `GET /api/ccm/rooms` - List perpetual rooms
- `POST /api/ccm/rooms/[roomId]/join` - Join room
- `POST /api/ccm/rooms/[roomId]/leave` - Leave room
- `GET /api/ccm/rooms/[roomId]/status` - Room status
- `POST /api/ccm/game/[sessionId]/c-suite-select` - Round 1 C-Suite selection
- `POST /api/ccm/game/[sessionId]/submit-cards` - Submit card selection
- `POST /api/ccm/game/[sessionId]/lock-in` - Lock in selection
- `POST /api/ccm/game/[sessionId]/mvp-select` - Save MVP card
- `GET /api/ccm/game/[sessionId]/leaderboard` - Get rankings
- `GET /api/ccm/game/[sessionId]/status` - Game state

**Reusability:** 95% - endpoints exist, need scoring logic updates

---

### ✅ UI Components (Partially Complete)
**Location:** `src/components/ccm/`

**Ready to Use:**
1. **CCMGoldenCard.tsx** ✅
   - Golden Card display
   - States: available/selected/used/disabled
   - **Reusability:** 100% - just update 120 → 130 points

2. **CCMVictoryScreen.tsx** ✅
   - Final rankings
   - Play again / Leave buttons
   - **Reusability:** 80% - needs XP conversion display

3. **CCMIntermission.tsx** ✅
   - Between-round countdown
   - **Reusability:** 100% - ready

4. **CCMHub.tsx** ✅
   - Room lobby
   - Player list
   - **Reusability:** 90% - ready

5. **CCMGameRoom.tsx** ⚠️
   - Main game interface
   - **Reusability:** 40% - needs major refactor (turn-based → simultaneous)

**Missing Components (Need to Build):**
- GameBoard.tsx - Circular table layout
- PlayerPosition.tsx - Player card around table
- ChallengeCard.tsx - Center challenge display
- RoleCard.tsx - Role card display
- SynergyCard.tsx - Synergy card display
- MVPCard.tsx - MVP card display
- RoundTimer.tsx - Countdown timer
- ScoreReveal.tsx - Score breakdown animation
- Leaderboard.tsx - Live rankings

---

### ✅ Database Content (Needs Updates)
**Location:** `scripts/seed-ccm-content.sql`

**Current Content:**
- 30 Challenge Cards ✅ (complete)
- 50 Role Cards ⚠️ (need 10 COO roles)
- 5 Synergy Cards ⚠️ (need name updates)
- 4 Perpetual Rooms ✅ (complete)

**Updates Needed:**
1. Add 10 COO role cards
2. Update synergy card names (Strategic Sage → The Pathfinder, etc.)
3. Update Golden Card points: 120 → 130
4. Update base scoring values: 80/60/30 → 60/40/25

---

## Implementation Phases

---

## Phase 1: Database & Content Updates (Week 1)
**Goal:** Update database content to match corrected design requirements

### Task 1.1: Rewrite All 30 Challenge Descriptions
**File:** `scripts/seed-ccm-content.sql`

**CRITICAL FIX - Challenge Scale & Perspective:**
Current challenges are written at wrong scale (e.g., "local coffee shop") instead of CEO/C-Suite level (e.g., "chain of organic coffee shops").

**Requirements:**
- ✅ CEO perspective: "Your company...", "The Board expects...", "Your division must..."
- ✅ Enterprise scale: Chains, divisions, multiple locations (NOT local shops)
- ✅ Measurable metrics: "15% decline", "30% of orders", "40% year-over-year"
- ✅ Executive-level implications: Board decisions, strategic planning, cross-functional impact

**Changes Needed:**
```sql
-- Update all 30 challenge descriptions (5 per P category)
--
-- BEFORE (wrong scale):
-- "Your local coffee shop is struggling with foot traffic. The owner needs help..."
--
-- AFTER (correct scale):
-- "Your chain of organic coffee shops is experiencing declining foot traffic across
-- all 50 locations. Employee morale is down, training programs are outdated, and
-- customer service scores have dropped 15% this quarter. The Board expects a
-- turnaround plan by next month."
```

**Implementation:**
1. Review all 30 existing challenge descriptions
2. Rewrite each to CEO perspective with enterprise scale
3. Add measurable business metrics to each challenge
4. Ensure C-Suite level decision-making is required

**Validation:**
- Each challenge mentions enterprise-level scale (chain, division, company, organization)
- Each challenge includes quantifiable metrics (%, counts, timelines)
- Each challenge references board/executive expectations
- No challenges reference single locations or small businesses

---

### Task 1.2: Update Scoring Base Points
**File:** `scripts/seed-ccm-content.sql`

**Changes:**
```sql
-- Update any hard-coded scoring references
-- Change: 80/60/30 → 60/40/25 (if present in seed data)
```

**Validation:**
- Run `scripts/validate-ccm-content.sql`
- Verify all content loads correctly

---

### Task 1.2: Add 10 COO Role Cards
**File:** `scripts/seed-ccm-content.sql`

**Add after existing role cards:**
```sql
-- COO Role Cards (10 cards)
INSERT INTO ccm_role_cards (
  card_code, display_name, description, c_suite_org,
  quality_for_people, quality_for_product, quality_for_process,
  quality_for_place, quality_for_promotion, quality_for_price,
  primary_soft_skills, secondary_soft_skills, color_theme, grade_level
) VALUES
  ('ROLE_COO_01', 'Operations Manager', 'Senior • Business', 'coo',
   'good', 'good', 'perfect', 'good', 'not_in', 'good',
   '["analytical-thinking", "leadership", "problem-solving"]',
   '["communication", "strategic-thinking"]', 'blue', 'all'),

  ('ROLE_COO_02', 'Supply Chain Director', 'Senior • Business', 'coo',
   'not_in', 'good', 'perfect', 'perfect', 'not_in', 'good',
   '["analytical-thinking", "strategic-thinking", "problem-solving"]',
   '["leadership"]', 'blue', 'all'),

  ('ROLE_COO_03', 'Process Analyst', 'Mid • Business', 'coo',
   'not_in', 'not_in', 'perfect', 'good', 'not_in', 'not_in',
   '["analytical-thinking", "critical-thinking"]',
   '["problem-solving"]', 'blue', 'all'),

  -- Add 7 more COO roles...
  ;
```

**Research Needed:**
- Find 10 realistic COO-related roles
- Assign quality ratings aligned with COO lens (strong in Process, Product, Place)

---

### Task 1.3: Update Synergy Card Names
**File:** `scripts/seed-ccm-content.sql`

**✅ COMPLETED - Synergy card_code values updated:**
```sql
-- All 5 synergy cards updated in database seed file:
-- 1. CCM_SYNERGY_CAPTAIN_CONNECTOR → Captain Connector (Collaboration & Communication +20%)
-- 2. CCM_SYNERGY_THE_PATHFINDER → The Pathfinder (Critical Thinking & Planning +15%)
-- 3. CCM_SYNERGY_MASTER_IMPROVER → Master Improver (Innovation & Creativity +20%)
-- 4. CCM_SYNERGY_MISSION_STARTER → Mission Starter (Analytical Thinking & Research +15%)
-- 5. CCM_SYNERGY_CHIEF_VIBE → Chief Vibe (Empathy & Leadership +15%)
```

**Code References Updated:**
- `scripts/seed-ccm-content.sql` lines 1155-1208: All card_code, display_name, and description fields updated
- `src/components/ccm/CCMGameRoom.tsx` lines 622, 639: Mock data uses correct card codes

---

### Task 1.4: Update Database Enum for COO
**New Migration:** `supabase/migrations/20251019_add_coo_to_c_suite.sql`

```sql
-- Add COO to c_suite_org enum
ALTER TYPE c_suite_org ADD VALUE IF NOT EXISTS 'coo';

-- Verify enum values
SELECT enumlabel FROM pg_enum
WHERE enumtypid = 'c_suite_org'::regtype::oid
ORDER BY enumlabel;
```

---

### Task 1.5: Update Golden Card Points
**File:** `src/components/ccm/CCMGoldenCard.tsx`

**Change:**
```tsx
// Line 111: Update label
<p className={`font-extrabold text-yellow-300 drop-shadow-lg ${config.fontSize}`}>
  130 POINTS  {/* Changed from 120 */}
</p>
```

**File:** `src/components/ccm/CCMGoldenCard.tsx` (Tooltip)
```tsx
// Line 157: Update tooltip
<p><strong>Score:</strong> Perfect 130 points</p>
```

---

### Task 1.6: Validation
**Run validation queries:**
```bash
psql $DATABASE_URL -f scripts/validate-ccm-content.sql
```

**Expected Results:**
- 30 challenges ✓
- 60 role cards (50 existing + 10 COO) ✓
- 5 synergy cards with new names ✓
- 4 perpetual rooms ✓

---

## Phase 2: Simultaneous Gameplay Core (Week 2)
**Goal:** Transform turn-based to simultaneous multiplayer with corrected role selection logic

### Task 2.1: Implement Dynamic Role Filtering by Challenge Type
**File:** `src/services/CCMGameEngine.ts` and `src/services/CCMService.ts`

**CRITICAL FIX - Role Card Selection:**
Current implementation shows 3 random roles from player's chosen C-Suite org.
**CORRECT:** Should show 6 roles filtered by current challenge's P category using quality ratings.

**Requirements:**
- Show **6 role cards** per round (not 3)
- Filter roles based on **current P category challenge** (not player's C-Suite choice)
- Use `quality_for_X` database fields (where X = current P category)
- **Priority 1:** All "perfect" quality roles for current P
- **Priority 2:** "good" quality roles to fill remaining slots (up to 6 total)
- **Exclude:** "not_in" quality roles never shown
- **Cross-C-Suite:** Players see roles from ALL C-Suite orgs that match the challenge

**Implementation:**

**CCMService.ts - Add new method:**
```typescript
async getRoleCardsForChallenge(pCategory: string): Promise<RoleCardData[]> {
  const qualityField = `quality_for_${pCategory}`;

  // Get all "perfect" quality roles for this P category
  const { data: perfectRoles, error: perfectError } = await supabase
    .from('ccm_role_cards')
    .select('*')
    .eq(qualityField, 'perfect')
    .eq('is_active', true);

  if (perfectError) throw perfectError;

  // Get "good" quality roles to fill remaining slots
  const { data: goodRoles, error: goodError } = await supabase
    .from('ccm_role_cards')
    .select('*')
    .eq(qualityField, 'good')
    .eq('is_active', true);

  if (goodError) throw goodError;

  // Combine: All perfect + good to reach 6 total
  let availableRoles = [...(perfectRoles || [])];
  const remainingSlots = 6 - availableRoles.length;

  if (remainingSlots > 0 && goodRoles) {
    availableRoles = [...availableRoles, ...goodRoles.slice(0, remainingSlots)];
  }

  // Shuffle to randomize order
  return availableRoles
    .sort(() => Math.random() - 0.5)
    .slice(0, 6)
    .map(transformToRoleCardData);
}
```

**CCMGameRoom.tsx - Update role loading:**
```typescript
// REMOVE: Loading 3 roles from player's C-Suite org
// ADD: Load 6 roles filtered by current P category

useEffect(() => {
  const loadRoleCardsForRound = async () => {
    if (currentRound > 1) {
      const pCategory = getCurrentPCategory(currentRound);
      const roles = await ccmService.getRoleCardsForChallenge(pCategory);
      setAvailableRoleCards(roles);
    }
  };

  loadRoleCardsForRound();
}, [currentRound]);
```

**Validation:**
- Each round shows 6 role cards
- All roles shown have "perfect" or "good" quality for current P category
- No "not_in" quality roles are shown
- Roles come from multiple C-Suite orgs (not just player's choice)
- Role selection updates each round based on P category

---

### Task 2.2: Refactor CCMGameEngine for Simultaneous Gameplay
**File:** `src/services/CCMGameEngine.ts`

**Changes Needed:**
1. **Remove turn-based logic:**
   - Delete `currentPlayerTurn` tracking
   - Remove turn rotation functions

2. **Add simultaneous lock-in tracking:**
```typescript
class CCMGameEngine {
  // Track lock-in status for all players
  private playerLockIns: Map<string, {
    lockedIn: boolean;
    timestamp: number;
    selection: CardSelection;
  }>;

  // Check if all players have locked in
  areAllPlayersLockedIn(sessionId: string): boolean {
    const activePlayers = this.getActivePlayers(sessionId);
    return activePlayers.every(p => this.playerLockIns.get(p.id)?.lockedIn);
  }

  // Calculate speed bonuses based on lock-in order
  calculateSpeedBonus(lockInPosition: number): number {
    if (lockInPosition === 1) return 0.20; // +20%
    if (lockInPosition === 2) return 0.10; // +10%
    if (lockInPosition === 3) return 0.05; // +5%
    return 0; // No bonus
  }
}
```

3. **Add lens multiplier matrix:**
```typescript
getLensMultiplier(cSuiteLens: string, pCategory: string): number {
  const multipliers = {
    ceo: { people: 1.2, product: 1.2, process: 1.2, place: 1.0, promotion: 1.0, price: 1.2 },
    cfo: { people: 1.0, product: 1.0, process: 1.2, place: 1.2, promotion: 1.0, price: 1.5 },
    cmo: { people: 1.0, product: 1.2, process: 1.0, place: 1.0, promotion: 1.5, price: 1.0 },
    cto: { people: 1.0, product: 1.5, process: 1.2, place: 1.2, promotion: 1.0, price: 1.0 },
    chro: { people: 1.5, product: 1.0, process: 1.2, place: 1.0, promotion: 1.0, price: 1.0 },
    coo: { people: 1.0, product: 1.2, process: 1.5, place: 1.2, promotion: 1.0, price: 1.0 },
  };
  return multipliers[cSuiteLens]?.[pCategory] || 1.0;
}
```

4. **Update score calculation:**
```typescript
calculateScore(params: {
  roleCard: RoleCard;
  synergyCard: SynergyCard;
  cSuiteLens: string;
  pCategory: string;
  lockInPosition: number;
  specialCardType: 'golden' | 'mvp' | null;
}): ScoreBreakdown {
  const { roleCard, synergyCard, cSuiteLens, pCategory, lockInPosition, specialCardType } = params;

  // Golden card = flat 130
  if (specialCardType === 'golden') {
    return { total: 130, breakdown: { base: 130 } };
  }

  // Get base points from quality rating
  const quality = roleCard[`quality_for_${pCategory}`];
  let basePoints = 0;
  if (quality === 'perfect') basePoints = 60;
  else if (quality === 'good') basePoints = 40;
  else basePoints = 25;

  // Add MVP bonus if applicable
  const mvpBonus = specialCardType === 'mvp' ? 10 : 0;

  // Apply synergy bonus
  const synergyPercent = this.getSynergyBonus(synergyCard);
  const afterSynergy = (basePoints + mvpBonus) * (1 + synergyPercent);

  // Apply lens multiplier
  const lensMultiplier = this.getLensMultiplier(cSuiteLens, pCategory);
  const afterLens = afterSynergy * lensMultiplier;

  // Apply speed bonus
  const speedBonus = this.calculateSpeedBonus(lockInPosition);
  const finalScore = afterLens * (1 + speedBonus);

  return {
    total: Math.round(finalScore),
    breakdown: {
      base: basePoints,
      mvpBonus,
      synergyBonus: synergyPercent,
      lensMultiplier,
      speedBonus,
    }
  };
}
```

---

### Task 2.2: Update CCMOrchestrator for Simultaneous Flow
**File:** `src/services/CCMOrchestrator.ts`

**Changes:**
1. Remove turn sequencing
2. Add all-players-ready detection
3. Implement timer-based auto-advance

```typescript
class CCMOrchestrator {
  async startRound(sessionId: string, roundNumber: number) {
    // Broadcast round_started to ALL players simultaneously
    await this.realtimeService.broadcast(sessionId, {
      type: 'round_started',
      roundNumber,
      pCategory: this.getCurrentPCategory(sessionId),
      timerDuration: roundNumber === 1 ? 20 : 45,
    });

    // Start timer
    this.startRoundTimer(sessionId, roundNumber === 1 ? 20 : 45);
  }

  async handlePlayerLockIn(sessionId: string, participantId: string, selection: any) {
    // Record lock-in
    const lockInPosition = this.gameEngine.recordLockIn(sessionId, participantId, selection);

    // Calculate score
    const score = this.gameEngine.calculateScore({ ...selection, lockInPosition });

    // Broadcast to other players (not revealing selection)
    await this.realtimeService.broadcast(sessionId, {
      type: 'player_locked_in',
      participantId,
      lockInPosition,
    });

    // Check if all players locked in
    if (this.gameEngine.areAllPlayersLockedIn(sessionId)) {
      await this.endRound(sessionId);
    }
  }

  async endRound(sessionId: string) {
    // Stop timer
    this.stopRoundTimer(sessionId);

    // Calculate all scores
    const scores = await this.gameEngine.calculateAllScores(sessionId);

    // Broadcast scores_revealed
    await this.realtimeService.broadcast(sessionId, {
      type: 'scores_revealed',
      scores,
    });

    // Update leaderboard
    await this.updateLeaderboard(sessionId);

    // Wait for intermission (5 seconds)
    await this.delay(5000);

    // Start next round or end game
    const currentRound = await this.getCurrentRound(sessionId);
    if (currentRound < 6) {
      await this.startRound(sessionId, currentRound + 1);
    } else {
      await this.endGame(sessionId);
    }
  }
}
```

---

### Task 2.3: Refactor CCMGameRoom.tsx - Remove Turn-Based Logic
**File:** `src/components/ccm/CCMGameRoom.tsx`

**Remove:**
```typescript
// DELETE these lines
const [currentPlayerTurn, setCurrentPlayerTurn] = useState(0);
const isMyTurn = players[currentPlayerTurn]?.id === playerId;
```

**Add:**
```typescript
// All players can act simultaneously
const [myLockInStatus, setMyLockInStatus] = useState<'selecting' | 'locked'>('selecting');
const [playerStatuses, setPlayerStatuses] = useState<Record<string, PlayerStatus>>({});

type PlayerStatus = {
  status: 'selecting' | 'locked' | 'disconnected';
  lockInTimestamp?: number;
};
```

**Update rendering:**
```tsx
{/* Show YOUR card selection panel */}
{myLockInStatus === 'selecting' && (
  <CardSelectionPanel
    roleCards={myRoleCards}
    synergyCards={mySynergyCards}
    onLockIn={handleLockIn}
  />
)}

{/* Show ALL other players around the table */}
{players.map(player => (
  <PlayerPosition
    key={player.id}
    player={player}
    status={playerStatuses[player.id]?.status}
    isYou={player.id === playerId}
  />
))}
```

---

### Task 2.4: Build Circular Table Layout Component
**New File:** `src/components/ccm/GameBoard.tsx`

```tsx
import React from 'react';
import { PlayerPosition } from './PlayerPosition';
import { ChallengeCard } from './ChallengeCard';
import { RoundTimer } from './RoundTimer';

interface GameBoardProps {
  players: Player[];
  currentPlayerId: string;
  challenge: Challenge;
  roundNumber: number;
  timerSeconds: number;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  players,
  currentPlayerId,
  challenge,
  roundNumber,
  timerSeconds,
}) => {
  // Calculate positions around circle (8 positions)
  const positions = [
    { top: '5%', left: '50%', transform: 'translateX(-50%)' },     // Top
    { top: '15%', right: '15%' },                                  // Top-right
    { top: '50%', right: '5%', transform: 'translateY(-50%)' },    // Right
    { bottom: '15%', right: '15%' },                               // Bottom-right
    { bottom: '5%', left: '50%', transform: 'translateX(-50%)' },  // Bottom
    { bottom: '15%', left: '15%' },                                // Bottom-left
    { top: '50%', left: '5%', transform: 'translateY(-50%)' },     // Left (YOU)
    { top: '15%', left: '15%' },                                   // Top-left
  ];

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Center: Challenge Card + Timer */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <ChallengeCard challenge={challenge} roundNumber={roundNumber} />
        <RoundTimer seconds={timerSeconds} />
      </div>

      {/* Player Positions Around Circle */}
      {players.map((player, index) => (
        <div
          key={player.id}
          className="absolute"
          style={positions[index]}
        >
          <PlayerPosition
            player={player}
            isYou={player.id === currentPlayerId}
          />
        </div>
      ))}
    </div>
  );
};
```

---

### Task 2.5: Build PlayerPosition Component
**New File:** `src/components/ccm/PlayerPosition.tsx`

```tsx
import React from 'react';
import { motion } from 'framer-motion';

interface PlayerPositionProps {
  player: {
    id: string;
    displayName: string;
    cSuiteLens: string;
    score: number;
    status: 'selecting' | 'locked' | 'disconnected';
  };
  isYou: boolean;
}

export const PlayerPosition: React.FC<PlayerPositionProps> = ({ player, isYou }) => {
  const statusColors = {
    selecting: 'border-yellow-400',
    locked: 'border-green-400',
    disconnected: 'border-red-400',
  };

  const statusIcons = {
    selecting: '🟡',
    locked: '🟢',
    disconnected: '🔴',
  };

  const cSuiteIcons = {
    ceo: '👔',
    cfo: '💰',
    cmo: '📢',
    cto: '💻',
    chro: '🤝',
    coo: '⚙️',
  };

  return (
    <motion.div
      className={`
        glass-card p-4 rounded-lg border-2 ${statusColors[player.status]}
        ${isYou ? 'ring-4 ring-blue-500 scale-110' : ''}
      `}
      whileHover={{ scale: 1.05 }}
    >
      {/* Player Info */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{cSuiteIcons[player.cSuiteLens]}</span>
        <div>
          <p className="font-bold glass-text-primary">
            {player.displayName} {isYou && '(YOU)'}
          </p>
          <p className="text-sm glass-text-secondary">
            {player.cSuiteLens.toUpperCase()} Lens
          </p>
        </div>
      </div>

      {/* Score */}
      <div className="text-center mb-2">
        <p className="text-2xl font-bold glass-text-primary">{player.score}</p>
        <p className="text-xs glass-text-tertiary">points</p>
      </div>

      {/* Status */}
      <div className="flex items-center justify-center gap-2">
        <span className="text-xl">{statusIcons[player.status]}</span>
        <p className="text-xs glass-text-secondary capitalize">{player.status}</p>
      </div>
    </motion.div>
  );
};
```

---

### Task 2.6: Build C-Suite Lens Benefits Display Component
**New File:** `src/components/ccm/CSuiteLensDisplay.tsx`

**CRITICAL FIX - C-Suite Lens Visibility:**
Currently players choose C-Suite but don't see WHY it matters for the challenge.
**CORRECT:** Show lens explanation and scoring benefits after Round 1 completion.

**Requirements:**
- Display after all players lock in C-Suite selection (Round 1)
- Show for 3-5 seconds during "All Players Ready" transition
- Explain strategic perspective for player's chosen lens
- Show which P categories get multiplier bonuses
- Color-coded by C-Suite org

**Implementation:**

```typescript
interface CSuiteLensInfo {
  cSuite: 'ceo' | 'cfo' | 'cmo' | 'cto' | 'chro' | 'coo';
  description: string;
  strengths: Array<{
    pCategory: string;
    explanation: string;
    multiplier: number;
  }>;
}

const cSuiteLensData: Record<string, CSuiteLensInfo> = {
  ceo: {
    cSuite: 'ceo',
    description: 'As CEO, you retain ownership and see challenges through a leadership lens.',
    strengths: [
      { pCategory: 'people', explanation: 'Culture and leadership crisis affecting the organization', multiplier: 1.2 },
      { pCategory: 'product', explanation: 'Strategic positioning opportunity requiring oversight', multiplier: 1.2 },
      { pCategory: 'process', explanation: 'Operational efficiency requiring organizational alignment', multiplier: 1.2 },
      { pCategory: 'price', explanation: 'Profitability decision with strategic implications', multiplier: 1.2 }
    ]
  },
  cmo: {
    cSuite: 'cmo',
    description: 'As CMO, you delegate to Marketing and see challenges through a brand lens.',
    strengths: [
      { pCategory: 'promotion', explanation: 'Your core expertise—redefining brand connections', multiplier: 1.5 },
      { pCategory: 'product', explanation: 'Brand positioning and customer perception challenge', multiplier: 1.2 }
    ]
  },
  // ... other C-Suites
};

export const CSuiteLensDisplay: React.FC<{ cSuite: string }> = ({ cSuite }) => {
  const lensInfo = cSuiteLensData[cSuite];

  return (
    <motion.div
      className="glass-card p-6 rounded-xl max-w-2xl"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      <h3 className="text-2xl font-bold mb-4 text-center">
        Your {cSuite.toUpperCase()} Lens Benefits
      </h3>
      <p className="glass-text-secondary mb-4 text-center">{lensInfo.description}</p>

      <div className="space-y-3">
        <h4 className="font-bold">Your Strengths:</h4>
        {lensInfo.strengths.map(strength => (
          <div key={strength.pCategory} className="glass-subtle p-3 rounded-lg">
            <div className="flex justify-between items-center mb-1">
              <span className="font-semibold">{strength.pCategory.toUpperCase()}</span>
              <span className="text-green-400 font-bold">{strength.multiplier}x</span>
            </div>
            <p className="text-sm glass-text-tertiary">{strength.explanation}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
```

**Integration in CCMGameRoom.tsx:**
```typescript
const [showLensDisplay, setShowLensDisplay] = useState(false);

// After all players lock in Round 1
useEffect(() => {
  if (currentRound === 1 && allPlayersLockedIn) {
    setShowLensDisplay(true);
    setTimeout(() => {
      setShowLensDisplay(false);
      advanceToRound2();
    }, 4000); // Show for 4 seconds
  }
}, [currentRound, allPlayersLockedIn]);

return (
  <>
    {showLensDisplay && (
      <CSuiteLensDisplay cSuite={mySelectedCSuite} />
    )}
    {/* ... rest of game board */}
  </>
);
```

**Validation:**
- Display appears after Round 1 C-Suite selection
- Shows for 3-5 seconds
- Explains strategic perspective of chosen lens
- Lists all P categories with multiplier bonuses
- Automatically dismisses and advances to Round 2

---

### Task 2.7: Build Supporting Components
**New Files:**

1. **ChallengeCard.tsx** - Center challenge display
2. **RoundTimer.tsx** - Countdown timer with urgency states
3. **RoleCard.tsx** - Role card display with quality indicator
4. **SynergyCard.tsx** - Synergy card display
5. **MVPCard.tsx** - Saved MVP card display (already exists)
6. **ScoreReveal.tsx** - Animated score breakdown
7. **Leaderboard.tsx** - Live rankings
8. **CSuiteLensDisplay.tsx** - Lens benefits explanation (see Task 2.6)

---

## Phase 3: XP Conversion & Polish (Week 3)
**Goal:** Complete XP integration and visual polish

### Task 3.1: Build XP Conversion Service
**New File:** `src/services/CCMXPService.ts`

```typescript
export class CCMXPService {
  /**
   * Convert CCM game points to XP points
   * Formula: XP = Total Game Points ÷ 10
   */
  static convertGamePointsToXP(totalGamePoints: number): number {
    return Math.floor(totalGamePoints / 10);
  }

  /**
   * Award XP to user at end of game
   */
  static async awardGameXP(
    userId: string,
    gameSessionId: string,
    totalGamePoints: number
  ): Promise<{ xpEarned: number; newTotalXP: number }> {
    const xpEarned = this.convertGamePointsToXP(totalGamePoints);

    // Update user's total XP in database
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        total_xp: supabase.raw(`total_xp + ${xpEarned}`),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('total_xp')
      .single();

    if (error) throw error;

    // Log XP transaction
    await supabase.from('xp_transactions').insert({
      user_id: userId,
      source: 'ccm_game',
      source_id: gameSessionId,
      xp_amount: xpEarned,
      description: `Career Challenge Multiplayer - ${totalGamePoints} points`,
    });

    return {
      xpEarned,
      newTotalXP: data.total_xp,
    };
  }
}
```

---

### Task 3.2: Update VictoryScreen with XP Display
**File:** `src/components/ccm/CCMVictoryScreen.tsx`

**Add XP conversion display:**
```tsx
export const CCMVictoryScreen: React.FC<Props> = ({ gameSessionId, onPlayAgain, onLeave }) => {
  const [xpEarned, setXpEarned] = useState<number | null>(null);
  const [myScore, setMyScore] = useState(0);

  useEffect(() => {
    const awardXP = async () => {
      const userId = getCurrentUserId();
      const result = await CCMXPService.awardGameXP(userId, gameSessionId, myScore);
      setXpEarned(result.xpEarned);
    };
    awardXP();
  }, [gameSessionId, myScore]);

  return (
    <div className="victory-screen">
      {/* Final Rankings */}
      <Leaderboard gameSessionId={gameSessionId} />

      {/* XP Earned Display */}
      {xpEarned !== null && (
        <motion.div
          className="glass-card p-6 mt-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: 'spring' }}
        >
          <h3 className="text-2xl font-bold mb-4 text-center">🎓 XP Earned</h3>
          <div className="text-center">
            <p className="text-lg glass-text-secondary">
              {myScore} points → <span className="text-3xl font-bold text-green-400">{xpEarned} XP</span>
            </p>
            <p className="text-sm glass-text-tertiary mt-2">
              Added to your Pathfinity progress!
            </p>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 mt-6">
        <button onClick={onPlayAgain}>Play Again</button>
        <button onClick={onLeave}>Leave Room</button>
      </div>
    </div>
  );
};
```

---

### Task 3.3: Visual Polish & Animations
1. Card flip animations
2. Lock-in particle effects
3. Score reveal animations
4. Leaderboard position changes
5. Timer urgency (pulse when < 10 seconds)
6. Player status transitions

---

### Task 3.4: Mobile Responsiveness
1. Adapt circular layout for mobile (stack vertically)
2. Touch-friendly card selection
3. Responsive timer and challenge card
4. Mobile-optimized player positions

---

## Testing Plan

### Unit Tests
- [ ] Score calculation (all combinations)
- [ ] Lens multiplier matrix (all 6 × 6 combinations)
- [ ] Speed bonus calculation
- [ ] XP conversion (various point totals)
- [ ] Random P selection (no duplicates, 5 of 6)

### Integration Tests
- [ ] Round flow (start → select → lock → reveal)
- [ ] Real-time synchronization between clients
- [ ] Timer auto-advance
- [ ] Disconnect/reconnect handling

### Multiplayer Tests
- [ ] 2 player game
- [ ] 8 player game (max capacity)
- [ ] All players lock in simultaneously
- [ ] Mixed lock-in speeds (test speed bonuses)
- [ ] Player disconnection mid-game

### Content Validation
- [ ] All 30 challenges loadable
- [ ] All 60 role cards accessible
- [ ] COO roles have correct quality ratings
- [ ] Synergy cards have updated names
- [ ] Lens multipliers calculate correctly

---

## Success Metrics

### Phase 1 Complete When:
- ✅ All 30 challenge descriptions rewritten to CEO perspective at enterprise scale
- ✅ Each challenge includes measurable metrics and board-level expectations
- ✅ No challenges reference small businesses or single locations
- ✅ 60 role cards in database (including 10 COO)
- ✅ 5 synergy cards with updated names
- ✅ Golden Card shows 130 points
- ✅ Base points updated to 60/40/25
- ✅ COO enum added to c_suite_org type

### Phase 2 Complete When:
- ✅ Dynamic role filtering implemented (6 roles per challenge based on P category)
- ✅ Roles filtered using quality_for_X database fields (perfect/good, excluding not_in)
- ✅ Cross-C-Suite role selection working (not limited to player's chosen org)
- ✅ C-Suite lens benefits display component created and integrated
- ✅ Lens explanation shown after Round 1 completion
- ✅ Turn-based logic removed from CCMGameEngine
- ✅ Simultaneous lock-in system working
- ✅ Lens multiplier scoring implemented
- ✅ Circular table layout displays all players (4 players max)
- ✅ Real-time status indicators working
- ✅ All players can act at the same time

### Phase 3 Complete When:
- ✅ XP conversion service implemented
- ✅ Victory Screen shows XP earned
- ✅ XP added to user's total
- ✅ Mobile responsive
- ✅ Animations polished
- ✅ All tests passing

---

## File Reference Summary

### Files to Modify:
1. `scripts/seed-ccm-content.sql` - **CRITICAL:** Rewrite all 30 challenge descriptions to CEO perspective, add COO roles, update synergy names
2. `supabase/migrations/` - Add COO enum migration
3. `src/services/CCMService.ts` - **NEW:** Add getRoleCardsForChallenge() method for dynamic filtering
4. `src/services/CCMGameEngine.ts` - Simultaneous gameplay, lens multipliers, dynamic role loading
5. `src/services/CCMOrchestrator.ts` - Remove turn-based sequencing
6. `src/components/ccm/CCMGameRoom.tsx` - Refactor for simultaneous, update role loading logic (6 roles filtered by P category)
7. `src/components/ccm/CCMGoldenCard.tsx` - Update 120 → 130 points
8. `src/components/ccm/CCMVictoryScreen.tsx` - Add XP display
9. `src/components/ccm/PlayerCardTray.tsx` - Update to show 6 roles instead of 3

### Files to Create:
1. `src/services/CCMXPService.ts` - XP conversion logic
2. `src/components/ccm/GameBoard.tsx` - Circular table layout (already exists, needs 4-player optimization)
3. `src/components/ccm/PlayerPosition.tsx` - Player card around table
4. `src/components/ccm/ChallengeCard.tsx` - Center challenge (already exists)
5. `src/components/ccm/RoundTimer.tsx` - Countdown timer
6. `src/components/ccm/RoleCard.tsx` - Role card display (already exists)
7. `src/components/ccm/SynergyCard.tsx` - Synergy card display (already exists)
8. `src/components/ccm/MVPCard.tsx` - MVP card display (already exists)
9. `src/components/ccm/ScoreReveal.tsx` - Score animation
10. `src/components/ccm/Leaderboard.tsx` - Live rankings
11. **`src/components/ccm/CSuiteLensDisplay.tsx`** - **NEW:** C-Suite lens benefits explanation

---

## Next Steps

Ready to begin **Phase 1: Database & Content Updates** with corrected requirements?

**CRITICAL FIXES - Start with:**
1. **Rewrite all 30 challenge descriptions** to CEO perspective at enterprise scale (HIGHEST PRIORITY)
2. Add 10 COO role cards to database
3. Update synergy card names in database
4. Update Golden Card points to 130
5. Run validation scripts

**Estimated Time:** 4-6 hours for Phase 1 (challenge rewrites are time-intensive)

---

## Summary of Corrected Requirements

This implementation plan has been updated to reflect the **correct** game mechanics:

### ✅ What Changed:
1. **Challenge Descriptions**: Rewrite all 30 from small business → enterprise CEO perspective
2. **Role Card Selection**: Changed from "3 roles from player's C-Suite" → "6 roles filtered by challenge P category using quality ratings"
3. **C-Suite Lens Visibility**: Added UI component to show WHY lens matters and which P categories get bonuses
4. **Cross-C-Suite Roles**: Players now see roles from ALL C-Suite orgs that match the challenge, not just their chosen org

### ✅ What Stayed the Same:
1. 6 P's with 5 randomly selected per game
2. Lens multiplier scoring matrix
3. Simultaneous multiplayer gameplay
4. Speed bonuses for fast lock-ins
5. Golden Card (130 points) and MVP Card mechanics
6. 4 players max per game

### 🎯 Educational Impact:
- **CEO Delegation Narrative**: Players understand they're delegating enterprise-level challenges
- **Lens System Makes Sense**: Players see WHY their C-Suite choice affects scoring
- **Dynamic Role Selection**: Roles change each round based on challenge type, not static
- **Cross-Functional Learning**: Players see how different C-Suite roles approach same problems

