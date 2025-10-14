# Career Bingo Multiplayer - Implementation Status Report

**Date:** 2025-10-13
**Goal:** Complete Career Bingo multiplayer for Elementary school students
**Current Status:** ~55% Complete

---

## Executive Summary

Career Bingo multiplayer has **solid infrastructure** (database, services, AI agents, real-time system) but is **missing game orchestration and UI integration**. We have two parallel implementations:

1. **Standalone Test Version** (`MultiplayerGameRoom.tsx`) - Working with mocked data
2. **Database-Backed Version** - Services built, but not connected

**Key Gap:** No `GameOrchestrator` to connect the services to the UI and manage game flow.

---

## What's Built ✅

### 1. Database Infrastructure (100% Complete)

**Tables:**
- ✅ `dl_perpetual_rooms` - 5 featured rooms seeded
- ✅ `dl_game_sessions` - Tracks individual games
- ✅ `dl_session_participants` - Human + AI players
- ✅ `dl_spectators` - Waiting players
- ✅ `dl_click_events` - Player interactions
- ✅ `dl_clues` - 130 elementary-level career clues ready

**Functions & Triggers:**
- ✅ `calculate_bingo_slots()` - Dynamic slot calculation
- ✅ `update_room_stats()` - Automatic statistics
- ✅ `update_spectator_count()` - Real-time counts

**Verification:**
```bash
npx tsx scripts/query-db.ts
# Results:
# ✅ dl_clues: 130 rows (elementary level)
# ✅ dl_perpetual_rooms: 5 rows (GLOBAL01, GLOBAL02, GAME01, NURSE01, TEACH01)
# ✅ dl_game_sessions: 0 rows (no games played yet)
# ✅ dl_session_participants: 0 rows
# ✅ dl_spectators: 0 rows
# ✅ dl_click_events: 0 rows
```

---

### 2. Core Services (70% Complete)

#### DiscoveredLiveService.ts ✅ (Single-player logic)
**Location:** `src/services/DiscoveredLiveService.ts`

**Capabilities:**
- ✅ `initializeGame()` - Creates 5×5 bingo grid
- ✅ `generateBingoGrid()` - Unique career distribution
- ✅ `getNextQuestion()` - Difficulty-based clue selection
- ✅ `submitAnswer()` - Validation and scoring
- ✅ `checkForBingos()` - Row/column/diagonal detection
- ✅ `getGameSummary()` - Stats and achievements

**Usage:** Already powers single-player Career Bingo.

---

#### PerpetualRoomManager.ts ⚠️ (70% - Missing orchestration)
**Location:** `src/services/PerpetualRoomManager.ts`

**Capabilities:**
- ✅ `getFeaturedRooms()` - Room discovery
- ✅ `startNewGame()` - Session creation with AI fill
- ✅ `completeGame()` - Transition to intermission
- ✅ `addHumanParticipant()` - Player registration
- ✅ `addAIAgents()` - Bot generation
- ✅ `generateUniqueBingoCard()` - Per-player unique 5×5 grids
- ✅ `checkForBingos()` - Bingo detection logic
- ❌ Missing: Question cycling integration
- ❌ Missing: Click validation integration

**Key Insight:** Each player gets a **unique 5×5 card** (not shared grid).

---

#### AIAgentService.ts ✅ (100% - Ready to use)
**Location:** `src/services/AIAgentService.ts`

**Capabilities:**
- ✅ `createAgent()` - 4 difficulty levels (easy/medium/hard/expert)
- ✅ `createMixedTeam()` - Balanced bot distribution
- ✅ `decideClick()` - Realistic AI decision-making
- ✅ `batchDecideClicks()` - Process all AI agents
- ✅ `scheduleAIClick()` - Delayed click simulation

**AI Presets:**
- QuickBot: 60% accuracy, 2.5s response time
- SteadyBot: 75% accuracy, 4.0s response time
- ThinkBot: 90% accuracy, 6.0s response time
- ExpertBot: 95% accuracy, 3.0s response time

**Key Feature:** AI finds careers on their **unique grid**, not a shared grid.

---

#### DiscoveredLiveRealtimeService.ts ✅ (100% - Ready to use)
**Location:** `src/services/DiscoveredLiveRealtimeService.ts`

**Capabilities:**
- ✅ `subscribeToRoom()` - WebSocket channel setup
- ✅ `broadcastGameStarted()` - Notify all players
- ✅ `broadcastQuestionStarted()` - Sync question display
- ✅ `broadcastPlayerClicked()` - Show click feedback
- ✅ `broadcastBingoAchieved()` - Celebrate wins
- ✅ `broadcastGameCompleted()` - Results screen
- ✅ Presence tracking (join/leave events)
- ✅ Database change listeners (postgres_changes)

**Key Feature:** All broadcast methods ready, just need to be called.

---

### 3. UI Components (50% Complete)

#### MultiplayerGameRoom.tsx ⚠️ (Working standalone, needs integration)
**Location:** `src/components/discovered-live/MultiplayerGameRoom.tsx`

**Current State:**
- ✅ 5×5 bingo grid with click handling
- ✅ Timer-based questions (8 seconds)
- ✅ AI player simulation
- ✅ Real-time leaderboard
- ✅ Bingo detection (rows, columns, diagonals)
- ✅ XP rewards and confetti animations
- ❌ Uses **mocked data** (hardcoded careers and questions)
- ❌ Not connected to database services
- ❌ Single shared grid (should be unique per player)

**Needs:**
1. Replace mocked data with `DiscoveredLiveService.getNextQuestion()`
2. Use `PerpetualRoomManager.generateUniqueBingoCard()` for user's card
3. Integrate `AIAgentService` for bot behavior
4. Add `DiscoveredLiveRealtimeService` for WebSocket sync

---

#### MultiplayerCard.tsx ✅ (95% - Almost ready)
**Location:** `src/components/discovered-live/MultiplayerCard.tsx`

**Capabilities:**
- ✅ 5×5 grid display with career icons
- ✅ Center square (2,2) shows current question
- ✅ Click handling with `onSquareClick` callback
- ✅ Visual feedback: correct (green glow + confetti), incorrect (red shake)
- ✅ Unlocked squares (green border)
- ✅ Bingo line highlighting (gold border with trophy)
- ✅ Timer display (color-coded countdown)
- ✅ Question display card below grid
- ✅ Disabled state during transitions
- ❌ Minor: Needs career icon mapping from database

**Key Design:** This component is **per-player** - each user sees their own unique card.

---

#### Supporting Components ✅
**All built and ready to use:**

1. **BingoGrid.tsx** - Reusable grid display
2. **QuestionDisplayCard.tsx** - Question + timer
3. **PlayerLeaderboardCard.tsx** - Live rankings
4. **QuestionTimer.tsx** - Countdown display
5. **PlayerStatusBar.tsx** - Player presence indicators
6. **RoomBrowser.tsx** - Room selection screen

---

## What's Missing ❌

### 1. GameOrchestrator Service (CRITICAL - 0% Complete)

**Purpose:** Central controller to manage game flow and connect all services.

**Required Functionality:**

```typescript
class GameOrchestrator {
  private sessionId: string;
  private questionIndex: number = 0;
  private currentTimer: NodeJS.Timeout | null = null;

  async runGameLoop() {
    // Main game loop - runs 20 questions
    while (this.questionIndex < 20) {
      await this.askQuestion();
      await this.delay(2000); // Pause between questions

      // Early exit if all bingo slots filled
      const session = await getSession(this.sessionId);
      if (session.bingoSlotsRemaining === 0) {
        break;
      }
    }

    await this.endGame();
  }

  async askQuestion() {
    // 1. Get next clue from database
    const clue = await discoveredLiveService.getNextClue(this.sessionId);

    // 2. Broadcast question_started to all participants
    await discoveredLiveRealtimeService.broadcastQuestionStarted(
      this.roomId,
      this.questionIndex + 1,
      clue.clueText,
      clue.skillConnection,
      clue.careerCode,
      15 // time limit in seconds
    );

    // 3. Schedule AI clicks
    const participants = await perpetualRoomManager.getSessionParticipants(this.sessionId);
    const aiDecisions = await aiAgentService.batchDecideClicks(clue, participants);

    for (const [participantId, decision] of aiDecisions) {
      setTimeout(async () => {
        await this.handleAIClick(participantId, decision);
      }, decision.responseTime * 1000);
    }

    // 4. Start timer
    this.startTimer(15);

    // 5. Wait for timer to expire
    await this.waitForTimer();

    // 6. Check all participants for new bingos
    await this.processAllBingos();

    this.questionIndex++;
  }

  async handleAIClick(participantId: string, decision: AIClickDecision) {
    // Validate and process AI click
    const isCorrect = decision.careerCode === this.currentClue.careerCode;

    if (isCorrect) {
      // Update participant's unlocked squares
      await this.unlockSquare(participantId, decision.position);

      // Broadcast click to all players
      await discoveredLiveRealtimeService.broadcastPlayerClicked(
        this.roomId,
        participantId,
        participant.displayName,
        decision.careerCode,
        decision.position,
        true,
        decision.responseTime
      );
    }
  }

  async handleHumanClick(participantId: string, row: number, col: number) {
    // Similar to AI click but triggered by user action
    const participant = await getParticipant(participantId);
    const clickedCareer = participant.bingoCard.careers[row][col];
    const isCorrect = clickedCareer === this.currentClue.careerCode;

    if (isCorrect) {
      await this.unlockSquare(participantId, { row, col });

      // Broadcast to others
      await discoveredLiveRealtimeService.broadcastPlayerClicked(
        this.roomId,
        participantId,
        participant.displayName,
        clickedCareer,
        { row, col },
        true,
        this.getResponseTime()
      );
    }

    // Record click in database
    await this.recordClick(participantId, row, col, isCorrect);
  }

  async processAllBingos() {
    const participants = await perpetualRoomManager.getSessionParticipants(this.sessionId);

    for (const participant of participants) {
      const newBingos = perpetualRoomManager.checkForBingos(
        participant.unlockedSquares,
        participant.completedLines
      );

      if (newBingos.rows.length > 0 || newBingos.columns.length > 0 || newBingos.diagonals.length > 0) {
        await this.claimBingo(participant, newBingos);
      }
    }
  }

  async claimBingo(participant: SessionParticipant, newBingos: CompletedLines) {
    const session = await getSession(this.sessionId);

    if (session.bingoSlotsRemaining <= 0) return;

    // Update participant's bingo count
    await updateParticipantBingos(participant.id);

    // Update session bingo slots
    await decrementBingoSlots(this.sessionId);

    // Broadcast celebration
    await discoveredLiveRealtimeService.broadcastBingoAchieved(
      this.roomId,
      participant.id,
      participant.displayName,
      participant.bingosWon + 1,
      'row', // or 'column' or 'diagonal'
      newBingos.rows[0], // index
      session.bingoSlotsRemaining - 1,
      50 // XP bonus
    );
  }
}
```

**Files to Create:**
- `src/services/GameOrchestrator.ts`

**Estimated Time:** 6-8 hours

---

### 2. Click Validation System (30% Complete)

**Current State:**
- ✅ Database table `dl_click_events` exists
- ✅ UI components have click handlers
- ❌ No validation logic
- ❌ No recording to database
- ❌ No broadcasting to other players

**What's Needed:**

```typescript
// In PerpetualRoomManager or GameOrchestrator
async validateClick(
  participantId: string,
  row: number,
  col: number,
  correctCareerCode: string
): Promise<{ isCorrect: boolean; unlockedPosition?: GridPosition }> {
  // 1. Get participant's card
  const participant = await getParticipant(participantId);
  const clickedCareer = participant.bingoCard.careers[row][col];

  // 2. Check if correct
  const isCorrect = clickedCareer === correctCareerCode;

  // 3. Record click event
  await this.recordClickEvent({
    game_session_id: participant.gameSessionId,
    participant_id: participantId,
    row_clicked: row,
    col_clicked: col,
    career_clicked: clickedCareer,
    was_correct: isCorrect,
  });

  // 4. If correct, unlock square
  if (isCorrect) {
    await this.unlockSquare(participantId, { row, col });
    return { isCorrect: true, unlockedPosition: { row, col } };
  }

  return { isCorrect: false };
}

async recordClickEvent(data: Partial<DbClickEvent>): Promise<void> {
  const client = await supabase();
  await client.from('dl_click_events').insert(data);
}

async unlockSquare(participantId: string, position: GridPosition): Promise<void> {
  const client = await supabase();

  // Get current unlocked squares
  const { data: participant } = await client
    .from('dl_session_participants')
    .select('unlocked_squares')
    .eq('id', participantId)
    .single();

  const unlocked = participant.unlocked_squares || [];

  // Add new position if not already unlocked
  if (!unlocked.some(p => p.row === position.row && p.col === position.col)) {
    unlocked.push(position);

    await client
      .from('dl_session_participants')
      .update({ unlocked_squares: unlocked })
      .eq('id', participantId);
  }
}
```

**Estimated Time:** 2-3 hours

---

### 3. Integration Tasks (Multiple components)

#### Task 3.1: Connect MultiplayerGameRoom to Real Services
**Current:** Uses mocked data
**Needed:** Replace with database queries

```typescript
// Instead of:
const questions: Question[] = [ /* hardcoded */ ];
const careers = [ /* hardcoded */ ];

// Use:
const session = await perpetualRoomManager.startNewGame(roomId);
const participants = await perpetualRoomManager.getSessionParticipants(session.id);
const myCard = participants.find(p => p.studentId === currentUser.id)!.bingoCard;

// During game:
const nextQuestion = await discoveredLiveService.getNextQuestion(session.id);
```

**Estimated Time:** 3-4 hours

---

#### Task 3.2: Add WebSocket Synchronization
**Current:** Local state only
**Needed:** Real-time broadcasts

```typescript
// In MultiplayerGameRoom.tsx useEffect:
useEffect(() => {
  // Subscribe to room events
  discoveredLiveRealtimeService.subscribeToRoom(roomId, {
    'question_started': handleQuestionStarted,
    'player_correct': handlePlayerCorrect,
    'player_incorrect': handlePlayerIncorrect,
    'bingo_achieved': handleBingoAchieved,
    'game_completed': handleGameCompleted,
  });

  return () => {
    discoveredLiveRealtimeService.unsubscribeFromRoom(roomId);
  };
}, [roomId]);

const handleQuestionStarted = (event: QuestionStartedEvent) => {
  setCurrentQuestion(event.data.clueText);
  setTimer(event.data.timeLimitSeconds);
};

const handlePlayerCorrect = (event: PlayerClickedEvent) => {
  // Show notification: "Marcus L. answered correctly!"
  // Update leaderboard
};

const handleBingoAchieved = (event: BingoAchievedEvent) => {
  // Show celebration: "🎉 Jessica M. got BINGO!"
  // Update bingo slots remaining
};
```

**Estimated Time:** 2-3 hours

---

### 4. Missing UI Components (Low Priority)

#### SpectatorView.tsx ❌ (Can wait)
- See all players' cards (grid view)
- Current question display
- Live leaderboard
- "Join Next Game" button

**Estimated Time:** 4-5 hours

---

#### MultiplayerResults.tsx ❌ (Can reuse single-player for now)
- Final rankings
- Individual stats
- XP breakdown
- "Play Again" button

**Estimated Time:** 2-3 hours

---

## Architecture Comparison

### Standalone Version (test-multiplayer-simple.html)
```
User Click → Local State Update → Check Bingo → Update UI
     ↓
AI Click (setTimeout) → Local State Update → Update UI
```
**Pros:** Simple, fast, works
**Cons:** No persistence, no real multiplayer, mocked data

---

### Target Architecture (Production)
```
User Click → GameOrchestrator.handleHumanClick()
            ↓
            1. Validate click
            2. Record to dl_click_events
            3. Update dl_session_participants.unlocked_squares
            4. Broadcast via WebSocket
            5. Check for bingos
            6. If bingo: Claim slot, broadcast celebration

AI Click (scheduled by GameOrchestrator)
         ↓
         1. AIAgentService.decideClick() - Find career on unique card
         2. GameOrchestrator.handleAIClick()
         3. Same validation/recording flow as human

Question Cycle (managed by GameOrchestrator)
              ↓
              1. Get next clue from database
              2. Broadcast question_started
              3. Schedule AI clicks (staggered timing)
              4. Start 15-second timer
              5. Wait for timer OR all players answered
              6. Process bingos for all participants
              7. Delay 2 seconds
              8. Next question
```

**Pros:** Persistent, scalable, real multiplayer
**Cons:** More complex, requires orchestration layer

---

## Key Design Decisions

### 1. Unique Cards Per Player ✅
**Design:** Each player gets a unique 5×5 grid with different career placements.

**Rationale:**
- Prevents "follow the leader" behavior
- Tests individual career knowledge
- More engaging (players can't copy each other)
- Already implemented in `PerpetualRoomManager.generateUniqueBingoCard()`

**Example:**
```
Player 1's Card:          Player 2's Card:
[Chef  Nurse  Pilot]      [Pilot Doctor  Chef]
[Doctor Artist  ...]      [Artist Nurse   ...]
[...   QUESTION ...]      [...   QUESTION ...]
```

Question: "I prepare meals" → Answer: Chef
- Player 1 clicks top-left
- Player 2 clicks top-right (different position!)

---

### 2. Click-to-Answer (Not Multiple Choice) ✅
**Design:** Players click careers on their card instead of selecting from 4 options.

**Rationale:**
- Faster gameplay (no reading options)
- More challenging (must scan 25 careers)
- Unique to multiplayer format
- Already implemented in `MultiplayerCard.tsx`

---

### 3. Limited Bingo Slots ✅
**Design:** Only `Math.ceil(playerCount / 2)` bingos available (e.g., 3 slots for 6 players).

**Rationale:**
- Creates competition ("first to 3 wins")
- Game can end early (doesn't always go to 20 questions)
- Formula already implemented: `calculateBingoSlots(playerCount)`

**Example:**
- 4 players → 2 bingo slots
- 6 players → 3 bingo slots
- 8 players → 4 bingo slots

---

### 4. AI Agents with Human Names ✅
**Design:** AI bots have names like "Marcus L." and "Jessica M." (not "Bot1", "Bot2").

**Rationale:**
- More immersive experience
- Elementary students feel like playing with peers
- Already implemented in `MultiplayerGameRoom.tsx` and `AIAgentService.ts`

---

## Implementation Roadmap

### Phase 1: Core Game Loop (CRITICAL - 8-10 hours)

**Goal:** Get a working 1v3 (human + 3 AI bots) game from start to finish.

1. **Create GameOrchestrator.ts** (6 hours)
   - Game loop with 20 questions
   - Question cycling logic
   - AI click scheduling
   - Bingo checking after each question
   - Timer management

2. **Add Click Validation** (2 hours)
   - `validateClick()` method
   - Record to `dl_click_events`
   - Update `dl_session_participants.unlocked_squares`

3. **Basic Testing** (2 hours)
   - Create test page or use existing MultiplayerGameRoom
   - Join room → Start game → Answer questions → See bingos

**Deliverable:** Working game loop (no WebSocket yet, just local testing).

---

### Phase 2: Real-Time Sync (MEDIUM - 4-6 hours)

**Goal:** Add WebSocket broadcasts so multiple human players can play together.

1. **Integrate DiscoveredLiveRealtimeService** (3 hours)
   - Call broadcasts in GameOrchestrator
   - Subscribe to events in MultiplayerGameRoom
   - Handle question_started, player_clicked, bingo_achieved

2. **Add Event Handlers** (2 hours)
   - Update UI when other players click
   - Show notifications (e.g., "Marcus got BINGO!")
   - Update leaderboard in real-time

3. **Test with 2+ Browsers** (1 hour)
   - Open 2 tabs, join same room
   - Verify clicks appear for both players
   - Verify bingos broadcast correctly

**Deliverable:** True multiplayer experience.

---

### Phase 3: Polish & Production (LOW - 6-8 hours)

1. **Results Screen** (2 hours)
   - Show final rankings
   - Individual stats
   - XP rewards

2. **Spectator View** (4 hours)
   - See all players' cards
   - "Join Next Game" button
   - Wait time counter

3. **Error Handling** (2 hours)
   - Disconnection handling
   - Reconnection logic
   - Timeout handling

**Deliverable:** Production-ready multiplayer Career Bingo.

---

## Testing Strategy

### Unit Tests
```typescript
// Test bingo detection
test('checkForBingos detects row completion', () => {
  const unlocked = [
    { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 },
    { row: 0, col: 3 }, { row: 0, col: 4 }
  ];
  const result = perpetualRoomManager.checkForBingos(unlocked, { rows: [], columns: [], diagonals: [] });
  expect(result.rows).toContain(0);
});

// Test AI decision making
test('AI finds correct career on unique card', async () => {
  const clue = { careerCode: 'chef', ... };
  const card = { careers: [['chef', 'nurse', ...], ...] };
  const config = aiAgentService.createAgent('easy');

  const decision = await aiAgentService.decideClick(clue, card, config);
  expect(decision.position).toEqual({ row: 0, col: 0 });
});
```

---

### Integration Tests
```typescript
// Test game flow
test('complete game from start to finish', async () => {
  // 1. Start game
  const session = await perpetualRoomManager.startNewGame(roomId);
  expect(session.status).toBe('active');

  // 2. Get participants
  const participants = await perpetualRoomManager.getSessionParticipants(session.id);
  expect(participants.length).toBe(4); // 1 human + 3 AI

  // 3. Ask questions
  for (let i = 0; i < 20; i++) {
    await orchestrator.askQuestion();
  }

  // 4. Verify game completed
  const finalSession = await getSession(session.id);
  expect(finalSession.status).toBe('completed');
});
```

---

### Manual Testing Checklist
```
□ Can join a room
□ See unique 5×5 card with careers
□ Center square (2,2) shows "QUESTION"
□ Question appears on screen
□ Timer counts down from 15 → 0
□ Click correct career → square unlocks (green glow)
□ Click wrong career → red shake animation
□ AI bots click at realistic times
□ Complete row → BINGO! celebration (confetti)
□ Leaderboard updates with XP
□ Game ends after 20 questions
□ Results screen shows rankings
□ Can play again
```

---

## Database Queries for Debugging

```sql
-- Check game sessions
SELECT * FROM dl_game_sessions ORDER BY started_at DESC LIMIT 5;

-- Check participants in a game
SELECT
  participant_type,
  display_name,
  bingos_won,
  correct_answers,
  total_xp,
  connection_status
FROM dl_session_participants
WHERE game_session_id = 'YOUR_SESSION_ID'
ORDER BY bingos_won DESC, total_xp DESC;

-- Check click events
SELECT
  p.display_name,
  c.career_clicked,
  c.was_correct,
  c.clicked_at
FROM dl_click_events c
JOIN dl_session_participants p ON c.participant_id = p.id
WHERE c.game_session_id = 'YOUR_SESSION_ID'
ORDER BY c.clicked_at;

-- Check clues being used
SELECT career_code, clue_text, difficulty, times_shown
FROM dl_clues
WHERE grade_category = 'elementary'
ORDER BY times_shown ASC
LIMIT 10;
```

---

## Next Steps (Priority Order)

### CRITICAL (Must do first)
1. **Create GameOrchestrator.ts** - Central game controller
   - File: `src/services/GameOrchestrator.ts`
   - Connects all services together
   - Manages question cycling
   - Handles AI and human clicks
   - Checks bingos after each question

2. **Add Click Validation** - Record clicks to database
   - Add `validateClick()` to PerpetualRoomManager
   - Record to `dl_click_events` table
   - Update `unlocked_squares` in database

### HIGH (Do next)
3. **Integrate MultiplayerGameRoom** - Connect UI to services
   - Replace mocked data with real database queries
   - Use unique cards per player
   - Connect click handlers to GameOrchestrator

4. **Add WebSocket Sync** - Real-time broadcasts
   - Call broadcasts in GameOrchestrator
   - Subscribe to events in UI
   - Test with multiple browsers

### MEDIUM (Polish)
5. **Results Screen** - Show final rankings
6. **Error Handling** - Disconnections, timeouts
7. **Spectator View** - Waiting room experience

---

## Questions for User

1. **Arcade Structure:** Should Career Bingo live in a "Quick Play" section (5-10 min games) while ECG Challenge goes in "Strategy" section (20-30 min games)?

2. **Room Themes:** Should perpetual rooms be themed by:
   - Career category (Healthcare, Technology, Arts)
   - Grade level (K-2, 3-5, 6-8)
   - Both?

3. **AI Difficulty:** Should AI bots in elementary rooms be easier (60% accuracy) or mixed difficulty?

4. **Bingo Slots:** Current formula is `Math.ceil(playerCount / 2)`. Good, or too competitive?

---

## Success Criteria

**Career Bingo is "complete" when:**
- ✅ Can join a room and start a game
- ✅ See unique 5×5 card with 130+ careers
- ✅ Questions cycle automatically every 15 seconds
- ✅ Click correct career → unlock square
- ✅ AI bots play realistically
- ✅ Complete row/column/diagonal → BINGO!
- ✅ Game ends after 20 questions or all bingo slots filled
- ✅ See results screen with rankings
- ✅ Multiple human players can play together (WebSocket sync)
- ✅ Works on mobile and desktop

---

**Report Complete**
**Total Estimated Time to Completion:** 18-24 hours
**Current Blocker:** Missing GameOrchestrator service
**Recommendation:** Start with Phase 1 (Core Game Loop)
