# Discovered Live! - Perpetual Live Rooms

**Date:** 2025-10-12
**Status:** 🔵 Design Phase
**Concept:** Always-on rooms with continuous games, drop-in spectating, and AI-filled competition

---

## 🎯 Core Concept: "The Game Never Stops"

**Traditional Room (What We DON'T Want):**
```
Player creates room → Waits for others → Starts game → Game ends → Room closes
❌ Waiting is boring
❌ Empty rooms
❌ No sense of ongoing activity
```

**Perpetual Room (What We WANT):**
```
Room exists 24/7 → Game #1 in progress → Ends → 10s intermission → Game #2 starts
✅ Always something happening
✅ Drop in and spectate
✅ Join next game immediately
✅ Feels alive and busy
```

---

## 🔄 Room Lifecycle

### Perpetual Room States

```
┌─────────────────────────────────────────────────────────────┐
│                    PERPETUAL ROOM CYCLE                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐                                           │
│  │   ACTIVE     │  Game in progress                         │
│  │   GAME       │  • AI agents + human players              │
│  │              │  • Questions being asked                  │
│  │   Duration:  │  • Bingos being won                       │
│  │   5-10 min   │  • Spectators watching                   │
│  └──────┬───────┘                                           │
│         │                                                    │
│         ↓ (Game completes: all bingo slots filled)          │
│         │                                                    │
│  ┌──────┴───────┐                                           │
│  │ INTERMISSION │  Brief pause between games                │
│  │              │  • Show results & winners                 │
│  │   Duration:  │  • Spectators can join next game         │
│  │   10 seconds │  • New cards generated                    │
│  │              │  • AI agents auto-fill                    │
│  └──────┬───────┘                                           │
│         │                                                    │
│         ↓ (Timer expires)                                   │
│         │                                                    │
│  ┌──────┴───────┐                                           │
│  │   ACTIVE     │  Next game starts immediately             │
│  │   GAME #2    │  • New players from spectators            │
│  │              │  • Fresh bingo cards                      │
│  │              │  • New ball sequence                      │
│  └──────────────┘                                           │
│         │                                                    │
│         ↓ (Cycle repeats forever)                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 👥 Player Journey

### Scenario 1: Player Joins During Active Game

```
PLAYER ENTERS ROOM (Game #5 in progress)
├─ Current game: Question 12/20, 2 bingos won already
├─ Player automatically enters SPECTATOR MODE
│  ├─ Can see all players' cards
│  ├─ Can see current question
│  ├─ Can see leaderboard
│  └─ Can watch who's winning
│
├─ UI shows: "Game in progress! You'll play next game in ~3 minutes"
│
└─ Player watches current game excitedly

GAME #5 ENDS (After 3 minutes)
├─ Results screen: "QuickBot wins with 2 bingos!"
├─ 10-second intermission countdown
└─ UI shows: "Next game starting in 10...9...8..."

GAME #6 STARTS
├─ Player auto-joins as active participant
├─ Gets unique bingo card
├─ Competes with AI agents + other humans
└─ Plays full game to completion
```

### Scenario 2: Player in Active Game, New Player Joins

```
GAME #8 IN PROGRESS
├─ You are playing (Question 8/20)
├─ New player "Sarah" enters room
│
├─ Sarah enters spectator mode
│  └─ Sees your card and everyone else's
│
└─ You continue playing (Sarah's presence doesn't affect you)

GAME #8 ENDS
├─ You completed game (maybe won a bingo!)
├─ Results shown to all
│
├─ 10-second intermission
│  ├─ You can choose: "Play again" or "Leave room"
│  └─ Sarah automatically queued for next game
│
└─ GAME #9 STARTS
   ├─ You play again (if you stayed)
   ├─ Sarah plays (her first game)
   └─ AI fills remaining slots
```

---

## 🏠 Room Structure

### Room Types

```typescript
interface PerpetualRoom {
  // Room identification
  id: string;
  room_code: string;              // "GAME01", "NURSE02", etc.
  theme_code: string;             // 'game-tester', 'nurse', 'global'

  // Room state
  status: 'active' | 'intermission';

  // Current game
  current_game_number: number;    // 1, 2, 3, ... (increments forever)
  current_game_id: string;        // Current dl_game_sessions record

  // Next game
  next_game_starts_at: Date;      // For intermission countdown

  // Capacity
  max_players_per_game: number;   // 4, 6, 8
  current_player_count: number;   // Active players in current game
  spectator_count: number;        // Waiting for next game

  // Settings
  bingo_slots_per_game: number;   // Calculated from max_players
  question_time_limit: number;    // 15s, 10s, 5s based on grade
  questions_per_game: number;     // 20

  // AI Configuration
  ai_fill_enabled: boolean;       // Always true for live rooms
  ai_difficulty: 'mixed';         // Mix of easy/medium/hard bots

  // Room activity
  total_games_played: number;
  total_bingos_won: number;
  peak_concurrent_players: number;

  // Timestamps
  created_at: Date;
  last_game_started_at: Date;
  is_active: boolean;             // Can be paused by admin
}
```

---

## 🗄️ Database Schema Updates

### 1. `dl_perpetual_rooms` (Always-On Rooms)

```sql
CREATE TABLE dl_perpetual_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Room identification
  room_code VARCHAR(20) UNIQUE NOT NULL,      -- 'GAME01', 'NURSE02'
  room_name VARCHAR(200) NOT NULL,            -- 'Game Tester Room #1'
  theme_code VARCHAR(100) REFERENCES dl_room_themes(theme_code),

  -- Current state
  status VARCHAR(20) NOT NULL DEFAULT 'active',  -- 'active', 'intermission'
  current_game_number INTEGER DEFAULT 1,
  current_game_id UUID,                       -- References dl_game_sessions

  -- Next game timing
  next_game_starts_at TIMESTAMPTZ,
  intermission_duration_seconds INTEGER DEFAULT 10,

  -- Capacity
  max_players_per_game INTEGER NOT NULL DEFAULT 4,
  current_player_count INTEGER DEFAULT 0,
  spectator_count INTEGER DEFAULT 0,

  -- Game settings
  bingo_slots_per_game INTEGER NOT NULL,
  question_time_limit_seconds INTEGER NOT NULL,
  questions_per_game INTEGER DEFAULT 20,
  grade_level VARCHAR(20),

  -- AI configuration
  ai_fill_enabled BOOLEAN DEFAULT true,
  ai_difficulty_mix VARCHAR(20) DEFAULT 'mixed',

  -- Analytics
  total_games_played INTEGER DEFAULT 0,
  total_unique_players INTEGER DEFAULT 0,
  total_bingos_won INTEGER DEFAULT 0,
  peak_concurrent_players INTEGER DEFAULT 0,
  avg_game_duration_seconds INTEGER,

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_game_started_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_perpetual_rooms_code ON dl_perpetual_rooms(room_code);
CREATE INDEX idx_perpetual_rooms_theme ON dl_perpetual_rooms(theme_code);
CREATE INDEX idx_perpetual_rooms_status ON dl_perpetual_rooms(status);
CREATE INDEX idx_perpetual_rooms_active ON dl_perpetual_rooms(is_active);
```

### 2. `dl_game_sessions` (Individual Games Within Room)

```sql
CREATE TABLE dl_game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Room association
  perpetual_room_id UUID NOT NULL REFERENCES dl_perpetual_rooms(id),
  game_number INTEGER NOT NULL,              -- 1, 2, 3, ... (within this room)

  -- Game state
  status VARCHAR(20) NOT NULL DEFAULT 'active',  -- 'active', 'completed'

  -- Bingo configuration (inherited from room)
  bingo_slots_total INTEGER NOT NULL,
  bingo_slots_remaining INTEGER NOT NULL,
  bingo_winners JSONB DEFAULT '[]',          -- Who won each bingo

  -- Ball sequence
  balls_selected INTEGER[] NOT NULL,          -- [5, 42, 17, ...] - predetermined
  balls_called INTEGER[] DEFAULT '{}',        -- [5, 42, ...] - already called
  current_ball_number INTEGER,
  current_question_index INTEGER DEFAULT 0,

  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,

  -- Statistics
  total_participants INTEGER DEFAULT 0,
  human_participants INTEGER DEFAULT 0,
  ai_participants INTEGER DEFAULT 0,

  UNIQUE(perpetual_room_id, game_number)
);

CREATE INDEX idx_sessions_room ON dl_game_sessions(perpetual_room_id);
CREATE INDEX idx_sessions_status ON dl_game_sessions(status);
```

### 3. `dl_session_participants` (Who's Playing Each Game)

```sql
CREATE TABLE dl_session_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Session association
  game_session_id UUID NOT NULL REFERENCES dl_game_sessions(id) ON DELETE CASCADE,
  perpetual_room_id UUID NOT NULL REFERENCES dl_perpetual_rooms(id),

  -- Participant type
  participant_type VARCHAR(20) NOT NULL,     -- 'human', 'ai_agent', 'spectator'
  student_id UUID REFERENCES students(id),   -- NULL for AI
  display_name VARCHAR(100) NOT NULL,

  -- AI config (if AI)
  ai_difficulty VARCHAR(20),
  ai_personality VARCHAR(50),

  -- Game state
  bingo_card JSONB NOT NULL,                 -- Unique card for this game
  unlocked_squares JSONB DEFAULT '[]',
  completed_lines JSONB DEFAULT '{}',        -- {rows: [], columns: [], diagonals: []}

  -- Scoring
  bingos_won INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  incorrect_answers INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,

  -- Status
  is_spectator BOOLEAN DEFAULT false,        -- Watching current game
  is_active BOOLEAN DEFAULT true,            -- Still in room

  -- Timing
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ
);

CREATE INDEX idx_session_parts_session ON dl_session_participants(game_session_id);
CREATE INDEX idx_session_parts_student ON dl_session_participants(student_id);
CREATE INDEX idx_session_parts_type ON dl_session_participants(participant_type);
```

### 4. `dl_spectators` (Currently Watching)

```sql
CREATE TABLE dl_spectators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Room association
  perpetual_room_id UUID NOT NULL REFERENCES dl_perpetual_rooms(id),
  current_game_session_id UUID REFERENCES dl_game_sessions(id),

  -- Student info
  student_id UUID NOT NULL REFERENCES students(id),
  display_name VARCHAR(100) NOT NULL,

  -- Status
  will_join_next_game BOOLEAN DEFAULT true,

  -- Timestamps
  started_spectating_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(perpetual_room_id, student_id)
);

CREATE INDEX idx_spectators_room ON dl_spectators(perpetual_room_id);
CREATE INDEX idx_spectators_student ON dl_spectators(student_id);
```

---

## 🎮 Room Management System

### Auto-Create Perpetual Rooms on Startup

```typescript
// Initialize featured rooms when server starts
const PERPETUAL_ROOMS_CONFIG = [
  // Global Rooms
  {
    room_code: 'GLOBAL01',
    room_name: 'All Careers - Room 1',
    theme_code: 'global',
    max_players_per_game: 4,
    grade_level: 'all',
    question_time_limit_seconds: 12,
    is_featured: true
  },
  {
    room_code: 'GLOBAL02',
    room_name: 'All Careers - Room 2',
    theme_code: 'global',
    max_players_per_game: 6,
    grade_level: 'all',
    question_time_limit_seconds: 12,
    is_featured: true
  },

  // Career-Specific Rooms
  {
    room_code: 'GAME01',
    room_name: 'Game Tester Deep Dive',
    theme_code: 'game-tester',
    max_players_per_game: 4,
    grade_level: 'middle,high',
    question_time_limit_seconds: 10,
    is_featured: true
  },
  {
    room_code: 'NURSE01',
    room_name: 'Nursing Deep Dive',
    theme_code: 'nurse',
    max_players_per_game: 4,
    grade_level: 'all',
    question_time_limit_seconds: 12,
    is_featured: true
  },
  {
    room_code: 'TEACH01',
    room_name: 'Teaching Deep Dive',
    theme_code: 'teacher',
    max_players_per_game: 4,
    grade_level: 'all',
    question_time_limit_seconds: 12,
    is_featured: true
  }
];

async function initializePerpetualRooms() {
  for (const config of PERPETUAL_ROOMS_CONFIG) {
    // Check if room exists
    const exists = await checkRoomExists(config.room_code);
    if (!exists) {
      // Create new perpetual room
      await createPerpetualRoom(config);

      // Start first game immediately
      await startNewGameInRoom(config.room_code);
    }
  }
}
```

### Room State Machine

```typescript
class PerpetualRoomManager {

  // Start a new game in the room
  async startNewGame(roomId: string) {
    const room = await getPerpetualRoom(roomId);

    // 1. Create new game session
    const gameNumber = room.total_games_played + 1;
    const gameSession = await createGameSession({
      perpetual_room_id: roomId,
      game_number: gameNumber,
      bingo_slots_total: room.bingo_slots_per_game,
      bingo_slots_remaining: room.bingo_slots_per_game
    });

    // 2. Select balls for this game
    const themeBalls = await getThemedBalls(room.theme_code);
    const selectedBalls = shuffle(themeBalls).slice(0, 30);
    await updateGameSession(gameSession.id, {
      balls_selected: selectedBalls.map(b => b.ball_number)
    });

    // 3. Move spectators to active participants
    const spectators = await getSpectators(roomId);
    const humanParticipants = spectators.filter(s => s.will_join_next_game);

    // 4. Fill remaining slots with AI
    const aiNeeded = room.max_players_per_game - humanParticipants.length;
    const aiAgents = await spawnAIAgents(aiNeeded, room.ai_difficulty_mix);

    // 5. Generate unique cards for all participants
    for (const participant of [...humanParticipants, ...aiAgents]) {
      const card = await generateBingoCard(selectedBalls, room.theme_code);
      await createSessionParticipant({
        game_session_id: gameSession.id,
        participant_type: participant.type,
        student_id: participant.student_id,
        display_name: participant.display_name,
        bingo_card: card,
        ai_difficulty: participant.ai_difficulty,
        ai_personality: participant.ai_personality
      });
    }

    // 6. Update room state
    await updatePerpetualRoom(roomId, {
      status: 'active',
      current_game_number: gameNumber,
      current_game_id: gameSession.id,
      current_player_count: humanParticipants.length + aiAgents.length,
      spectator_count: 0,
      last_game_started_at: new Date()
    });

    // 7. Clear spectators (they're now active)
    await clearSpectators(roomId);

    // 8. Broadcast game start
    broadcastToRoom(roomId, {
      type: 'game_started',
      gameNumber: gameNumber,
      participants: [...humanParticipants, ...aiAgents]
    });

    // 9. Start calling balls
    this.startCallingBalls(gameSession.id);
  }

  // Handle game completion
  async completeGame(gameSessionId: string) {
    const session = await getGameSession(gameSessionId);
    const room = await getPerpetualRoom(session.perpetual_room_id);

    // 1. Mark session complete
    await updateGameSession(gameSessionId, {
      status: 'completed',
      completed_at: new Date(),
      duration_seconds: calculateDuration(session.started_at)
    });

    // 2. Calculate results
    const results = await calculateGameResults(gameSessionId);

    // 3. Broadcast results to room
    broadcastToRoom(room.id, {
      type: 'game_completed',
      results: results,
      winners: results.bingoWinners
    });

    // 4. Enter intermission
    const nextGameStartsAt = new Date(Date.now() + room.intermission_duration_seconds * 1000);
    await updatePerpetualRoom(room.id, {
      status: 'intermission',
      next_game_starts_at: nextGameStartsAt,
      total_games_played: room.total_games_played + 1
    });

    // 5. Broadcast intermission countdown
    broadcastToRoom(room.id, {
      type: 'intermission_started',
      nextGameStartsAt: nextGameStartsAt,
      countdownSeconds: room.intermission_duration_seconds
    });

    // 6. Schedule next game
    setTimeout(() => {
      this.startNewGame(room.id);
    }, room.intermission_duration_seconds * 1000);
  }

  // Handle player joining room
  async handlePlayerJoin(roomId: string, studentId: string, displayName: string) {
    const room = await getPerpetualRoom(roomId);

    if (room.status === 'active') {
      // Game in progress - add as spectator
      await addSpectator({
        perpetual_room_id: roomId,
        current_game_session_id: room.current_game_id,
        student_id: studentId,
        display_name: displayName,
        will_join_next_game: true
      });

      await updatePerpetualRoom(roomId, {
        spectator_count: room.spectator_count + 1
      });

      // Send spectator view
      const currentGame = await getGameSession(room.current_game_id);
      const participants = await getSessionParticipants(room.current_game_id);

      sendToPlayer(studentId, {
        type: 'joined_as_spectator',
        message: `Game ${room.current_game_number} in progress! You'll play next game.`,
        currentGame: currentGame,
        participants: participants,
        estimatedWaitTime: calculateEstimatedWaitTime(currentGame)
      });

    } else if (room.status === 'intermission') {
      // Between games - add as spectator for next game
      await addSpectator({
        perpetual_room_id: roomId,
        student_id: studentId,
        display_name: displayName,
        will_join_next_game: true
      });

      await updatePerpetualRoom(roomId, {
        spectator_count: room.spectator_count + 1
      });

      sendToPlayer(studentId, {
        type: 'joined_during_intermission',
        message: `Next game starting in ${calculateCountdown(room.next_game_starts_at)}s`,
        nextGameStartsAt: room.next_game_starts_at
      });
    }
  }
}
```

---

## 🎬 Spectator Mode

### Spectator View Features

```typescript
interface SpectatorView {
  // Room info
  roomInfo: {
    name: string;
    themeCode: string;
    gameNumber: number;
    status: 'active' | 'intermission';
  };

  // Current game (if active)
  currentGame?: {
    questionNumber: number;
    totalQuestions: number;
    bingoSlotsRemaining: number;
    currentQuestion: string;
    timeRemaining: number;
  };

  // All active players
  participants: Array<{
    displayName: string;
    isAI: boolean;
    bingoCard: BingoCard;      // Can see their card!
    unlockedSquares: number;
    bingosWon: number;
    currentXP: number;
  }>;

  // Leaderboard
  leaderboard: Array<{
    rank: number;
    displayName: string;
    bingosWon: number;
    xp: number;
  }>;

  // Estimated wait time
  estimatedWaitTime: {
    seconds: number;
    message: string;  // "~3 minutes until next game"
  };

  // Spectator options
  options: {
    canJoinNextGame: boolean;
    canLeaveRoom: boolean;
    canInviteFriend: boolean;
  };
}
```

### Spectator UI

```
┌─────────────────────────────────────────────────────────────┐
│  🎮 GAME TESTER ROOM - GAME #42 IN PROGRESS                 │
├─────────────────────────────────────────────────────────────┤
│  You're spectating! Next game starts in ~3 minutes          │
│  [✓ Join Next Game]  [Leave Room]  [Invite Friend]         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  CURRENT QUESTION (15/20):                                  │
│  🔴 Ball #42: "This career finds bugs in video games"      │
│  ⏱️ 8 seconds remaining                                     │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  LEADERBOARD:                       BINGOS LEFT: 1/3        │
│  1. 🎯 SteadyBot     2 bingos  245 XP  ✅ Answered         │
│  2. 👤 QuickBot      1 bingo   180 XP  ✅ Answered         │
│  3. 👤 Sarah         0 bingos  120 XP  ⏳ Thinking         │
│  4. 🧠 ThinkBot      0 bingos  100 XP  ⏳ Thinking         │
├─────────────────────────────────────────────────────────────┤
│  PLAYER CARDS (Click to view):                              │
│  [SteadyBot's Card] [QuickBot's Card] [Sarah's Card]       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🤖 AI Agent Auto-Fill

### Always Keep Rooms Active

```typescript
class AIAutoFillService {

  // Monitor room and fill with AI if needed
  async monitorRoomCapacity(roomId: string) {
    const room = await getPerpetualRoom(roomId);

    // Check if we have enough participants for next game
    const spectatorCount = await getSpectatorCount(roomId);
    const minPlayers = 2;  // Minimum for a game

    if (spectatorCount < minPlayers) {
      // Not enough humans - fill with AI
      const aiNeeded = room.max_players_per_game - spectatorCount;
      await queueAIAgentsForNextGame(roomId, aiNeeded);
    }
  }

  // Spawn AI with mixed difficulties
  async spawnAIAgents(count: number, difficultyMix: string) {
    const agents: AIAgent[] = [];

    if (difficultyMix === 'mixed') {
      // Create mix: 1 easy, 1-2 medium, 1 hard
      if (count >= 1) agents.push(createAIAgent('easy'));
      if (count >= 2) agents.push(createAIAgent('medium'));
      if (count >= 3) agents.push(createAIAgent('medium'));
      if (count >= 4) agents.push(createAIAgent('hard'));

      // Fill remaining with medium
      while (agents.length < count) {
        agents.push(createAIAgent('medium'));
      }
    }

    return agents;
  }
}
```

---

## 📊 Room Browser UI

### Featured Rooms List

```
┌─────────────────────────────────────────────────────────────┐
│  DISCOVERED LIVE! - JOIN A ROOM                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🌟 FEATURED ROOMS                                          │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 🌍 GLOBAL01 - All Careers                     LIVE 🔴  │ │
│  │ Game #156 in progress • 3 players • 2 bingos left      │ │
│  │ Question 8/20 • ~4 min wait • [JOIN & SPECTATE]        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 🎮 GAME01 - Game Tester Deep Dive         LIVE 🔴     │ │
│  │ Game #89 in progress • 4 players • 1 bingo left        │ │
│  │ Question 14/20 • ~2 min wait • [JOIN & SPECTATE]       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 🏥 NURSE01 - Nursing Deep Dive           INTERMISSION  │ │
│  │ Next game starting in 7 seconds • [JOIN NOW!]          │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 👨‍🏫 TEACH01 - Teaching Deep Dive            LIVE 🔴     │ │
│  │ Game #203 in progress • 2 players • 2 bingos left      │ │
│  │ Question 3/20 • ~6 min wait • [JOIN & SPECTATE]        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Benefits of Perpetual Rooms

### 1. **Always Something Happening**
```
✅ No waiting for lobby to fill
✅ Games running 24/7
✅ Feels alive and busy
✅ Social proof (see others playing)
```

### 2. **Spectator Engagement**
```
✅ Watch current game while waiting
✅ Learn by observing
✅ See strategies
✅ Get excited to play
```

### 3. **Guaranteed Games**
```
✅ AI fills empty slots
✅ Games never cancelled
✅ Always competitive
✅ No dead rooms
```

### 4. **Drop-In/Drop-Out**
```
✅ Join anytime
✅ Leave anytime
✅ Play multiple games in a row
✅ Or just play once and leave
```

### 5. **Replayability**
```
✅ Different opponents each game
✅ Different cards each game
✅ Track improvements over time
✅ Climb leaderboards
```

---

## 🚀 Implementation Plan

### Phase 1: Core Perpetual System (Week 1)
- [ ] Create database tables (dl_perpetual_rooms, dl_game_sessions, etc.)
- [ ] Build room state machine (active → intermission → active)
- [ ] Auto-initialize featured rooms on startup
- [ ] Test basic cycle with AI-only games

### Phase 2: Spectator Mode (Week 2)
- [ ] Spectator UI showing current game
- [ ] Real-time updates for spectators
- [ ] Player card viewing
- [ ] Leaderboard display
- [ ] Estimated wait time calculation

### Phase 3: Join/Leave Flow (Week 2-3)
- [ ] Handle player joining during active game
- [ ] Handle player joining during intermission
- [ ] Move spectators to active on game start
- [ ] Handle mid-game disconnections

### Phase 4: AI Auto-Fill (Week 3)
- [ ] Spawn AI agents to fill slots
- [ ] Mixed difficulty AI teams
- [ ] AI behavior in themed rooms
- [ ] AI performance tuning

### Phase 5: Room Browser (Week 3-4)
- [ ] Room list with live status
- [ ] Join button with wait times
- [ ] Featured rooms display
- [ ] Room search/filter

---

**This is perfect! Ready to build?**

Which component should I start with first:
1. Database schema for perpetual rooms?
2. Room state machine logic?
3. Spectator UI mockup?
4. Room initialization script?