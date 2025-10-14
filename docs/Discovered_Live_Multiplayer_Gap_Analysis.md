# Discovered Live! Multiplayer - Gap Analysis

**Date:** 2025-10-13
**Purpose:** Compare original design documents against actual implementation to identify gaps

---

## 📋 Summary

### What We Built: ✅
- Core database infrastructure (5 tables, functions, triggers)
- Complete TypeScript types and converters
- AI agent simulation service (4 difficulty levels)
- Perpetual room management service
- Real-time WebSocket event system
- Room browser UI component

### What's Missing: ⚠️
- Click interaction system and validation
- Multiplayer card UI component
- Spectator view UI component
- Game controller/orchestrator
- Question cycling logic
- Timer synchronization
- Bingo claiming system
- Results/leaderboard display

---

## 🔍 Detailed Gap Analysis

### 1. DATABASE SCHEMA ✅ (Complete)

**Original Design:**
- dl_perpetual_rooms ✅
- dl_game_sessions ✅
- dl_session_participants ✅
- dl_spectators ✅
- dl_click_events ✅

**Implementation Status:**
✅ All tables created with correct schema
✅ Indexes and foreign keys configured
✅ Functions and triggers implemented
✅ RLS disabled for testing
✅ 5 featured rooms pre-seeded

**Gaps:**
- ❌ No `balls_selected` / `balls_called` columns (design mentioned these but we're using clues instead)
- ✅ Fixed: Using `questions_asked` array instead of ball numbers (correct for our design)

---

### 2. CLICK-TO-ANSWER MECHANICS ❌ (Missing)

**Original Design Requirements:**

```typescript
// Player clicks square on their card
onSquareClick(row: number, col: number) {
  // 1. Validate click is for current question
  // 2. Check if clicked career matches correct answer
  // 3. If correct:
  //    - Unlock square with green glow + confetti
  //    - Broadcast to other players
  //    - Check for bingos
  //    - Award XP
  // 4. If incorrect:
  //    - Shake animation + red flash
  //    - No broadcast
  //    - No unlock
}
```

**Implementation Status:**
❌ No click validation logic
❌ No click event recording to `dl_click_events`
❌ No correct/wrong feedback system
❌ No unlock square logic for multiplayer

**What's Needed:**
1. **ClickHandlerService** or extend PerpetualRoomManager
   - `validateClick(participantId, row, col, correctCareer)`
   - `recordClickEvent(...)` - Insert to dl_click_events
   - `broadcastClick(...)` - Notify other players via WebSocket

2. **Client-side click handling**
   - Disable double-clicking
   - Show immediate visual feedback
   - Handle network latency

---

### 3. QUESTION CYCLING SYSTEM ⚠️ (Partially Complete)

**Original Design:**
```
QUESTION CYCLE:
1. Select next clue from database
2. Broadcast question_started event to all participants
3. Start timer (15s/10s/5s based on grade)
4. Wait for player clicks
5. After timer expires OR all players answered:
   - Show results
   - Check for bingos
   - Move to next question
6. Repeat until game ends
```

**Implementation Status:**
✅ Question selection logic exists in DiscoveredLiveService
⚠️ No automatic cycling mechanism
❌ No timer synchronization across clients
❌ No "wait for all players" logic
❌ No question transition delays

**What's Needed:**
1. **GameOrchestrator Service**
   ```typescript
   class GameOrchestrator {
     async startQuestionCycle(sessionId: string) {
       while (!gameComplete) {
         // 1. Get next question
         const question = await getNextQuestion();

         // 2. Broadcast to all participants
         await broadcastQuestionStarted(...);

         // 3. Start timer
         const timer = setTimeout(() => {
           this.endQuestion();
         }, timeLimit * 1000);

         // 4. Wait for clicks (AI + humans)
         await this.waitForClicks();

         // 5. Check for bingos
         await this.checkAllBingos();

         // 6. Delay before next question
         await delay(2000);
       }
     }
   }
   ```

2. **Timer Synchronization**
   - Server-side authoritative timer
   - Client-side countdown display
   - Handle clock skew

---

### 4. BINGO SLOT CLAIMING SYSTEM ⚠️ (Logic exists, not integrated)

**Original Design:**
```
BINGO CLAIMING RULES:
1. First player to complete line claims slot
2. Player can win multiple bingos
3. Simultaneous bingos both count
4. Game ends when all slots filled OR 20 questions done
```

**Implementation Status:**
✅ `checkForBingos()` logic in PerpetualRoomManager
✅ Bingo slot calculation formula implemented
✅ Database tracks `bingo_winners` JSONB array
❌ No integration with question cycle
❌ No real-time bingo claiming
❌ No "game end" trigger when slots fill

**What's Needed:**
1. **After each question:**
   ```typescript
   // Check each participant for new bingos
   for (const participant of participants) {
     const newBingos = checkForBingos(
       participant.unlockedSquares,
       participant.completedLines
     );

     if (newBingos.length > 0 && bingoSlotsRemaining > 0) {
       // Claim bingo slot
       await claimBingoSlot(participant, newBingos[0]);
       bingoSlotsRemaining--;

       // Broadcast celebration
       await broadcastBingoAchieved(...);

       // Check if game should end
       if (bingoSlotsRemaining === 0) {
         await endGame();
       }
     }
   }
   ```

---

### 5. AI AGENT INTEGRATION ⚠️ (Service exists, not integrated)

**Original Design:**
```
AI CLICK SIMULATION:
1. When question starts, each AI agent decides:
   - Will I answer correctly? (based on accuracy rate)
   - Which square to click? (find career on my card)
   - How long to wait? (realistic response time)
2. Schedule click after response time
3. Broadcast click event when time elapses
```

**Implementation Status:**
✅ AIAgentService with `decideClick()` method
✅ Realistic timing and accuracy simulation
✅ Grid-aware position finding
❌ No integration with question cycle
❌ No automatic AI click scheduling
❌ No AI click broadcasting

**What's Needed:**
1. **In GameOrchestrator after broadcasting question:**
   ```typescript
   async handleAIClicks(sessionId: string, question: CareerClue) {
     // Get AI participants
     const aiParticipants = await getAIParticipants(sessionId);

     // Get their click decisions
     const decisions = await aiAgentService.batchDecideClicks(
       question,
       aiParticipants
     );

     // Schedule each AI click
     for (const [participantId, decision] of decisions) {
       setTimeout(async () => {
         // Simulate AI clicking their card
         await handleClick(participantId, decision.position);
       }, decision.responseTime * 1000);
     }
   }
   ```

---

### 6. MULTIPLAYER CARD UI COMPONENT ❌ (Missing)

**Original Design:**
```typescript
interface MultiplayerCardProps {
  myGrid: string[][];
  unlockedPositions: GridPosition[];
  completedLines: BingoLines;
  currentQuestion: string | null;
  timeRemaining: number;
  onSquareClick: (row: number, col: number) => void;
  disabled: boolean;
}

// Square States:
// - Default: Career visible, clickable, gray border
// - Unlocked: Career visible, green glow, not clickable
// - Center (2,2): Question text, not clickable
// - Correct click: Animate with confetti burst
// - Wrong click: Shake animation, red flash
// - In bingo line: Gold border highlight
```

**Implementation Status:**
❌ Component doesn't exist

**What's Needed:**
- `MultiplayerCard.tsx` component
- Square click handlers
- Animation states (correct, wrong, unlocked, bingo line)
- Center square question display
- Timer countdown display
- Career icons and names display

---

### 7. SPECTATOR VIEW UI ❌ (Missing)

**Original Design:**
```
SPECTATOR VIEW:
- See all players' cards
- Current question display
- Leaderboard with live updates
- "Join Next Game" button
- Estimated wait time
- Real-time click indicators
```

**Implementation Status:**
❌ Component doesn't exist

**What's Needed:**
- `SpectatorView.tsx` component
- Multi-card grid display (showing all players)
- Live leaderboard
- Wait time counter
- "Will join next game" toggle

---

### 8. REAL-TIME SYNCHRONIZATION ⚠️ (Infrastructure exists, not fully used)

**Original Design:**
- Broadcast question starts
- Broadcast player clicks
- Broadcast bingos
- Broadcast game end
- Handle disconnections
- Presence tracking

**Implementation Status:**
✅ DiscoveredLiveRealtimeService with all broadcast methods
✅ WebSocket channel management
✅ Event handlers and listeners
❌ Not integrated with game flow
❌ No disconnection handling
❌ No reconnection logic

**What's Needed:**
1. **Hook up broadcasts in GameOrchestrator**
2. **Add disconnection handlers**
   ```typescript
   onPresenceLeave(participantId) {
     // Mark participant as disconnected
     // Don't end game, just show "disconnected" status
     // If they reconnect, resume their state
   }
   ```

---

### 9. GAME FLOW ORCHESTRATION ❌ (Missing)

**Original Design:**
```
GAME LIFECYCLE:
1. Room in intermission
2. Spectators + AI join as participants
3. Game starts → broadcast game_started
4. Question cycle begins (20 questions)
5. For each question:
   - Broadcast question
   - Start timer
   - Handle clicks (human + AI)
   - Check bingos
   - Update leaderboard
6. Game ends → calculate results
7. Broadcast game_completed
8. Enter intermission (10s)
9. Start next game
```

**Implementation Status:**
✅ `startNewGame()` - Creates session and participants
✅ `completeGame()` - Ends session and starts intermission
❌ No automatic question cycling
❌ No game loop controller
❌ No "next game" scheduler

**What's Needed:**
**`GameOrchestrator.tsx` or `GameController.ts`:**
```typescript
class GameController {
  private sessionId: string;
  private questionIndex: number = 0;
  private questionTimer: NodeJS.Timeout | null = null;

  async runGameLoop() {
    while (this.questionIndex < 20) {
      await this.askQuestion();
      await delay(2000); // Pause between questions

      // Check if game should end early (all bingo slots filled)
      const session = await getSession(this.sessionId);
      if (session.bingoSlotsRemaining === 0) {
        break;
      }
    }

    await this.endGame();
  }

  async askQuestion() {
    // 1. Get next question
    const question = await getNextQuestion(this.sessionId);

    // 2. Broadcast to participants
    await discoveredLiveRealtimeService.broadcastQuestionStarted(...);

    // 3. Handle AI clicks
    await this.scheduleAIClicks(question);

    // 4. Start timer
    this.startQuestionTimer(15);

    // 5. Wait for timer to expire
    await this.waitForTimer();

    // 6. Check for bingos
    await this.processBingos();

    this.questionIndex++;
  }
}
```

---

### 10. RESULTS & LEADERBOARD ❌ (Missing)

**Original Design:**
```
RESULTS SCREEN:
- Final rankings (by bingos won, then XP)
- Individual stats (correct answers, streaks, bingos)
- XP rewards breakdown
- "Play Again" vs "Leave Room" buttons
```

**Implementation Status:**
❌ No results screen component

**What's Needed:**
- `MultiplayerResults.tsx` component
- Leaderboard display
- Individual participant stats
- Celebration animations
- Auto-transition to intermission

---

### 11. TIMER DISPLAY ❌ (Missing)

**Original Design:**
```
TIMER DISPLAY:
⏱️ 12 seconds (green)
⏱️ 5 seconds (yellow - warning)
⏱️ 2 seconds (red - urgent)
⏱️ TIME UP! (red flash)
```

**Implementation Status:**
❌ No timer UI component

**What's Needed:**
- `QuestionTimer.tsx` component
- Color-coded countdown
- Pulse animation when low
- "TIME UP!" flash

---

### 12. PLAYER STATUS SIDEBAR ❌ (Missing)

**Original Design:**
```
PLAYER STATUS:
- Avatar + name
- Bingos won (🏆 icons)
- Current XP
- "Answered ✓" or "Thinking..." status
```

**Implementation Status:**
❌ No player status component

**What's Needed:**
- `PlayerStatusBar.tsx` component
- Real-time status updates
- Bingo count display
- Answer status indicators

---

## 📊 Completion Matrix

| Component | Design | DB | Service | UI | Integration | Status |
|-----------|--------|----|---------|----|-------------|--------|
| Perpetual Rooms | ✅ | ✅ | ✅ | ✅ | ⚠️ | 80% |
| Game Sessions | ✅ | ✅ | ✅ | ❌ | ❌ | 60% |
| AI Agents | ✅ | ✅ | ✅ | N/A | ❌ | 70% |
| Click System | ✅ | ✅ | ❌ | ❌ | ❌ | 40% |
| Bingo Detection | ✅ | ✅ | ✅ | ❌ | ❌ | 60% |
| Real-time Events | ✅ | N/A | ✅ | ❌ | ❌ | 50% |
| Question Cycling | ✅ | ⚠️ | ⚠️ | ❌ | ❌ | 30% |
| Multiplayer Card | ✅ | N/A | N/A | ❌ | ❌ | 0% |
| Spectator View | ✅ | ✅ | ✅ | ❌ | ❌ | 50% |
| Results Screen | ✅ | ✅ | ⚠️ | ❌ | ❌ | 30% |
| Room Browser | ✅ | N/A | N/A | ✅ | ✅ | 100% |

**Overall Completion: ~55%**

---

## 🎯 Priority Gaps to Fill

### Critical Path (Must have for MVP):

1. **GameOrchestrator Service** (High Priority)
   - Runs the game loop
   - Cycles through questions
   - Manages timer
   - Triggers AI clicks
   - Checks bingos after each question
   - **Estimated: 4-6 hours**

2. **MultiplayerCard Component** (High Priority)
   - Display 5×5 grid with careers
   - Handle click events
   - Show question in center
   - Animations (correct, wrong, unlocked)
   - **Estimated: 4-6 hours**

3. **Click Validation & Recording** (High Priority)
   - Validate clicks server-side
   - Record to dl_click_events
   - Broadcast to other players
   - **Estimated: 2-3 hours**

4. **Bingo Claiming Integration** (Medium Priority)
   - Check bingos after each question
   - Claim slots first-come-first-served
   - End game when slots filled
   - **Estimated: 2-3 hours**

5. **Question Timer UI** (Medium Priority)
   - Countdown display
   - Color coding
   - Synchronization with server
   - **Estimated: 1-2 hours**

6. **PlayerStatusBar Component** (Medium Priority)
   - Show all participants
   - Live status updates
   - Bingo counts
   - **Estimated: 2-3 hours**

### Nice to Have:

7. **SpectatorView Component** (Low Priority)
   - Can use placeholder for now
   - Full implementation later
   - **Estimated: 3-4 hours**

8. **MultiplayerResults Component** (Low Priority)
   - Can reuse single-player results for now
   - Enhanced version later
   - **Estimated: 2-3 hours**

---

## 📝 Implementation Roadmap

### Sprint 1: Core Game Flow (15-20 hours)
```
Week 1:
✅ Database & Services (Done)
→ GameOrchestrator (6 hours)
→ MultiplayerCard UI (6 hours)
→ Click System (3 hours)
→ Basic Testing (2 hours)
```

### Sprint 2: Polish & Integration (10-15 hours)
```
Week 2:
→ Bingo Claiming (3 hours)
→ Timer UI (2 hours)
→ Player Status Bar (3 hours)
→ Results Screen (3 hours)
→ Integration Testing (4 hours)
```

### Sprint 3: Spectator & Advanced Features (8-12 hours)
```
Week 3:
→ Spectator View (4 hours)
→ Disconnection Handling (2 hours)
→ Sound Effects (2 hours)
→ Performance Optimization (2 hours)
→ Final Testing (2 hours)
```

---

## 🔥 Immediate Next Steps

To get a **working 1v3 bot demo**, we need:

1. **Create GameOrchestrator.ts** (6 hours)
   - Game loop
   - Question cycling
   - AI click scheduling
   - Bingo checking

2. **Create MultiplayerCard.tsx** (6 hours)
   - 5×5 grid display
   - Click handling
   - Basic animations

3. **Add click validation** (2 hours)
   - Validate in PerpetualRoomManager
   - Record clicks to database
   - Broadcast events

4. **Create simple test page** (2 hours)
   - Join room
   - Display card
   - See AI playing
   - Basic game flow

**Total: ~16 hours to working demo**

---

## ✅ What's Working Well

1. **Database Schema** - Solid foundation, well-structured
2. **Type System** - Comprehensive types with converters
3. **AI Agents** - Realistic behavior, good variety
4. **Real-time Infrastructure** - WebSocket system ready to use
5. **Room Management** - Perpetual room concept implemented

## ⚠️ What Needs Attention

1. **Game Orchestration** - Missing central controller
2. **UI Components** - Need multiplayer-specific components
3. **Integration** - Services not connected to UI
4. **Testing** - No end-to-end tests yet

---

## 💡 Recommendations

1. **Focus on GameOrchestrator first** - This is the missing "glue" that connects everything
2. **Build minimal MultiplayerCard** - Just enough to see it working
3. **Test incrementally** - Don't wait until everything is built
4. **Reuse single-player logic** - Adapt existing question/answer logic
5. **Start with 1v1 AI test** - Simplest case before adding more bots

---

**Gap Analysis Complete**
**Current Status:** Core infrastructure done (~55%), game logic integration needed
**Estimated Time to Working Demo:** 15-20 hours
**Estimated Time to Full MVP:** 30-40 hours
