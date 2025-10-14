# Discovered Live! - Multiplayer & AI Agent Design

**Date:** 2025-10-12
**Status:** 🔵 Design Phase
**Goal:** Build real-time multiplayer with AI agent players for testing and gameplay

---

## 🎯 Design Goals

1. **Real-time competitive multiplayer** - 2-4 players compete simultaneously
2. **AI agent players** - Intelligent bots to fill empty slots and enable testing
3. **Modular architecture** - Easy to add new game modes later
4. **Testable system** - You play against 3 AI agents to validate bingo logic
5. **Scalable foundation** - Ready for live player vs player matches

---

## 🏗️ Architecture Overview

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    GAME ROOM LIFECYCLE                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. LOBBY      → 2. STARTING    → 3. PLAYING  → 4. FINISHED │
│     Wait for      Countdown         Active        Results   │
│     players       3...2...1...      gameplay      & stats   │
│                                                              │
└─────────────────────────────────────────────────────────────┘

                           ↓

┌─────────────────────────────────────────────────────────────┐
│                    PLAYER TYPES                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  HUMAN PLAYER              AI AGENT PLAYER                  │
│  • Real student            • Autonomous bot                 │
│  • WebSocket connection    • Server-side execution          │
│  • Manual answers          • Intelligent answer selection   │
│  • Real response times     • Simulated response times       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Database Schema Updates

### New Tables

#### 1. `dl_game_rooms`
Represents a multiplayer game room/session.

```sql
CREATE TABLE dl_game_rooms (
  -- Identification
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_code VARCHAR(6) UNIQUE NOT NULL,  -- e.g., "ABC123" for easy joining

  -- Configuration
  room_name VARCHAR(100),
  max_players INTEGER NOT NULL DEFAULT 4,
  grade_category VARCHAR(20) NOT NULL,    -- elementary, middle, high
  total_questions INTEGER NOT NULL DEFAULT 20,

  -- State
  status VARCHAR(20) NOT NULL DEFAULT 'lobby',  -- lobby, starting, playing, finished
  current_question_index INTEGER DEFAULT 0,

  -- Shared game state
  shared_bingo_grid JSONB NOT NULL,       -- Same grid for all players
  current_question_id UUID,               -- Current clue being asked
  question_start_time TIMESTAMPTZ,        -- When current question started

  -- Timing
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,

  -- Creator
  created_by_user_id UUID REFERENCES auth.users(id),

  -- Settings
  allow_ai_players BOOLEAN DEFAULT true,
  auto_start_when_full BOOLEAN DEFAULT true,
  question_time_limit_seconds INTEGER DEFAULT 30
);

CREATE INDEX idx_dl_rooms_status ON dl_game_rooms(status);
CREATE INDEX idx_dl_rooms_code ON dl_game_rooms(room_code);
CREATE INDEX idx_dl_rooms_created_at ON dl_game_rooms(created_at);
```

#### 2. `dl_room_participants`
Tracks all players in a room (human + AI).

```sql
CREATE TABLE dl_room_participants (
  -- Identification
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES dl_game_rooms(id) ON DELETE CASCADE,

  -- Player info
  player_type VARCHAR(20) NOT NULL,       -- 'human' or 'ai_agent'
  student_id UUID REFERENCES students(id), -- NULL for AI agents
  display_name VARCHAR(100) NOT NULL,     -- Human name or AI bot name

  -- AI-specific
  ai_agent_difficulty VARCHAR(20),        -- 'easy', 'medium', 'hard', 'expert'
  ai_agent_personality VARCHAR(50),       -- 'speedy', 'careful', 'balanced'

  -- Player state
  is_ready BOOLEAN DEFAULT false,
  is_connected BOOLEAN DEFAULT true,
  join_order INTEGER,                     -- 1st, 2nd, 3rd, 4th player

  -- Game progress
  unlocked_squares JSONB DEFAULT '[]',
  completed_rows INTEGER[] DEFAULT '{}',
  completed_columns INTEGER[] DEFAULT '{}',
  completed_diagonals INTEGER[] DEFAULT '{}',

  -- Scoring
  correct_answers INTEGER DEFAULT 0,
  incorrect_answers INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  max_streak INTEGER DEFAULT 0,
  base_xp_earned INTEGER DEFAULT 0,
  bingo_bonus_xp INTEGER DEFAULT 0,
  streak_bonus_xp INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,

  -- Bingo achievements
  total_bingos INTEGER DEFAULT 0,
  first_bingo_at TIMESTAMPTZ,

  -- Timing
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,

  UNIQUE(room_id, student_id)  -- Human can't join same room twice
);

CREATE INDEX idx_dl_participants_room ON dl_room_participants(room_id);
CREATE INDEX idx_dl_participants_student ON dl_room_participants(student_id);
CREATE INDEX idx_dl_participants_type ON dl_room_participants(player_type);
```

#### 3. `dl_room_answers`
Tracks answers from all players in real-time.

```sql
CREATE TABLE dl_room_answers (
  -- Identification
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES dl_game_rooms(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES dl_room_participants(id) ON DELETE CASCADE,
  clue_id UUID NOT NULL REFERENCES dl_clues(id),

  -- Question context
  question_number INTEGER NOT NULL,
  options_shown JSONB NOT NULL,           -- Array of 4 career options
  correct_option_index INTEGER NOT NULL,

  -- Answer
  selected_option_index INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,

  -- Timing
  question_started_at TIMESTAMPTZ NOT NULL,
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  response_time_seconds NUMERIC(6,2),

  -- Result
  unlocked_position JSONB,                -- {row: number, col: number}
  xp_earned INTEGER DEFAULT 0,
  new_bingo_achieved BOOLEAN DEFAULT false,

  UNIQUE(room_id, participant_id, question_number)
);

CREATE INDEX idx_dl_room_answers_room ON dl_room_answers(room_id);
CREATE INDEX idx_dl_room_answers_participant ON dl_room_answers(participant_id);
CREATE INDEX idx_dl_room_answers_clue ON dl_room_answers(clue_id);
```

#### 4. `dl_game_events`
Real-time event log for spectating and replay.

```sql
CREATE TABLE dl_game_events (
  -- Identification
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES dl_game_rooms(id) ON DELETE CASCADE,

  -- Event details
  event_type VARCHAR(50) NOT NULL,        -- 'player_joined', 'answer_submitted', 'bingo_achieved', etc.
  participant_id UUID REFERENCES dl_room_participants(id),

  -- Event data
  event_data JSONB,                       -- Flexible event payload

  -- Timing
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dl_events_room ON dl_game_events(room_id);
CREATE INDEX idx_dl_events_type ON dl_game_events(event_type);
CREATE INDEX idx_dl_events_created ON dl_game_events(created_at);
```

---

## 🤖 AI Agent System

### AI Agent Types

We'll create different AI personalities for variety:

```typescript
interface AIAgentConfig {
  name: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  personality: 'speedy' | 'careful' | 'balanced';
  avatar: string;
  accuracyRate: number;        // 0-1, how often they answer correctly
  avgResponseTime: number;     // Seconds, simulated thinking time
  responseVariance: number;    // +/- variance in response time
}

const AI_AGENT_PRESETS: AIAgentConfig[] = [
  {
    name: 'QuickBot',
    difficulty: 'medium',
    personality: 'speedy',
    avatar: '⚡',
    accuracyRate: 0.70,
    avgResponseTime: 3,
    responseVariance: 1
  },
  {
    name: 'ThinkBot',
    difficulty: 'hard',
    personality: 'careful',
    avatar: '🧠',
    accuracyRate: 0.85,
    avgResponseTime: 8,
    responseVariance: 2
  },
  {
    name: 'SteadyBot',
    difficulty: 'medium',
    personality: 'balanced',
    avatar: '🎯',
    accuracyRate: 0.75,
    avgResponseTime: 5,
    responseVariance: 2
  },
  {
    name: 'ChampBot',
    difficulty: 'expert',
    personality: 'balanced',
    avatar: '🏆',
    accuracyRate: 0.95,
    avgResponseTime: 4,
    responseVariance: 1
  }
];
```

### AI Decision Logic

```typescript
class AIAgent {
  async makeDecision(
    clue: CareerClue,
    options: CareerOption[],
    difficulty: string
  ): Promise<{ selectedIndex: number; responseTime: number }> {
    // 1. Determine if agent answers correctly based on accuracy rate
    const correctIndex = options.findIndex(opt => opt.careerCode === clue.careerCode);
    const shouldAnswerCorrectly = Math.random() < this.config.accuracyRate;

    // 2. Select answer
    let selectedIndex: number;
    if (shouldAnswerCorrectly) {
      selectedIndex = correctIndex;
    } else {
      // Pick a wrong answer (weighted by distractor strategy)
      const wrongOptions = options
        .map((opt, idx) => idx)
        .filter(idx => idx !== correctIndex);
      selectedIndex = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
    }

    // 3. Simulate response time with personality variance
    const responseTime =
      this.config.avgResponseTime +
      (Math.random() - 0.5) * this.config.responseVariance * 2;

    return { selectedIndex, responseTime: Math.max(1, responseTime) };
  }
}
```

---

## 🎮 Game Modes Architecture

### Base Game Mode Interface

```typescript
interface GameMode {
  id: string;
  name: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
  supportsAIPlayers: boolean;

  // Lifecycle hooks
  onInitialize(room: GameRoom): Promise<void>;
  onPlayerJoin(room: GameRoom, player: Player): Promise<void>;
  onGameStart(room: GameRoom): Promise<void>;
  onAnswerSubmit(room: GameRoom, player: Player, answer: Answer): Promise<void>;
  onGameComplete(room: GameRoom): Promise<GameResults>;
}

// Concrete implementations
class ClassicBingoMode implements GameMode {
  id = 'classic-bingo';
  name = 'Classic Bingo';
  description = 'First player to complete a line wins!';
  minPlayers = 2;
  maxPlayers = 4;
  supportsAIPlayers = true;

  // Implementation...
}

class RaceTo5BingosMode implements GameMode {
  id = 'race-to-5';
  name = 'Race to 5 Bingos';
  description = 'First to complete 5 bingo lines wins!';
  minPlayers = 2;
  maxPlayers = 4;
  supportsAIPlayers = true;

  // Implementation...
}

class TeamBingoMode implements GameMode {
  id = 'team-bingo';
  name = 'Team Bingo';
  description = '2v2 teams compete for bingos!';
  minPlayers = 4;
  maxPlayers = 4;
  supportsAIPlayers = true;

  // Implementation...
}
```

---

## 🔄 Real-Time Flow with AI Agents

### Game Start Sequence

```
1. ROOM CREATION
   ├─ Human creates room (gets room code)
   ├─ System generates shared 5x5 bingo grid
   └─ Room enters 'lobby' status

2. PLAYER JOINING
   ├─ Human joins (participant_id created)
   ├─ System spawns 3 AI agents to fill slots
   │  ├─ QuickBot (easy)
   │  ├─ SteadyBot (medium)
   │  └─ ThinkBot (hard)
   └─ All players marked as 'ready'

3. COUNTDOWN (3 seconds)
   ├─ Room status → 'starting'
   ├─ All players see countdown
   └─ WebSocket broadcasts: { type: 'countdown', seconds: 3 }

4. FIRST QUESTION
   ├─ Room status → 'playing'
   ├─ Service loads first clue
   ├─ WebSocket broadcasts question to human
   └─ AI agents schedule their answers
```

### Question Answer Cycle

```
QUESTION POSED (t=0s)
├─ WebSocket → Human player sees question
├─ AI Agent 1 (QuickBot) schedules answer in 2.5s
├─ AI Agent 2 (SteadyBot) schedules answer in 5.2s
└─ AI Agent 3 (ThinkBot) schedules answer in 7.8s

ANSWERS SUBMITTED (t=0-30s)
├─ t=2.5s: QuickBot submits (correct)
│  ├─ Unlocks square (0,1)
│  ├─ XP calculated
│  └─ WebSocket broadcasts: { type: 'player_answered', player: 'QuickBot', isCorrect: true }
│
├─ t=5.2s: SteadyBot submits (correct)
│  ├─ Unlocks square (1,3)
│  ├─ Checks for bingo → none yet
│  └─ Broadcast answer event
│
├─ t=6.0s: Human submits (correct) ← YOU
│  ├─ Unlocks square (2,0)
│  └─ Broadcast answer event
│
└─ t=7.8s: ThinkBot submits (correct)
   ├─ Unlocks square (3,2)
   ├─ Checks for bingo → BINGO! (row 3 complete)
   └─ Broadcast: { type: 'bingo_achieved', player: 'ThinkBot', line: 'row-3' }

ALL ANSWERED → NEXT QUESTION
├─ 1 second pause to show results
├─ Load next question
└─ Repeat cycle
```

---

## 📡 WebSocket Events

### Client → Server

```typescript
// Human player actions
{
  type: 'join_room',
  roomCode: string,
  studentId: string,
  displayName: string
}

{
  type: 'submit_answer',
  roomId: string,
  participantId: string,
  selectedIndex: number,
  responseTime: number
}

{
  type: 'player_ready',
  roomId: string,
  participantId: string
}
```

### Server → Client

```typescript
// Game state updates
{
  type: 'room_updated',
  room: GameRoom,
  participants: Participant[]
}

{
  type: 'question_started',
  question: QuestionData,
  questionNumber: number,
  timeLimit: number
}

{
  type: 'player_answered',
  participantId: string,
  displayName: string,
  isCorrect: boolean,
  responseTime: number,
  unlockedPosition?: { row: number, col: number }
}

{
  type: 'bingo_achieved',
  participantId: string,
  displayName: string,
  bingoType: 'row' | 'column' | 'diagonal',
  bingoIndex: number
}

{
  type: 'game_finished',
  results: GameResults,
  winner: Participant
}
```

---

## 🧪 Testing Strategy

### Phase 1: You vs 3 AI Agents

**Setup:**
- Create test room with room code "TEST01"
- Auto-spawn 3 AI agents (easy, medium, hard)
- You play as the human player
- Run through 20 questions

**Validation:**
- ✅ All 4 players get unique squares (no overlaps)
- ✅ Bingo detection works correctly
- ✅ AI agents show realistic response times
- ✅ WebSocket updates arrive in real-time
- ✅ Game completes successfully with winner
- ✅ Final results show all player stats

### Phase 2: AI vs AI (Automated Testing)

**Setup:**
- Create room with 4 AI agents
- Run 100 games automatically
- Collect statistics

**Metrics:**
- Average game duration
- Bingo distribution (which lines complete most)
- XP distribution across difficulty levels
- Performance/memory usage

### Phase 3: Multi-Room Testing

**Setup:**
- Create 10 concurrent rooms
- Each with 4 AI agents
- Monitor server load

**Validation:**
- ✅ Rooms isolated (no cross-contamination)
- ✅ WebSocket connections stable
- ✅ Database handles concurrent writes
- ✅ No memory leaks

---

## 🏁 Win Conditions

### Mode 1: First Bingo Wins
- First player to complete ANY line wins
- Game ends immediately
- Others get participation XP

### Mode 2: Most Bingos (Default)
- Play all 20 questions
- Player with most bingos wins
- Tiebreaker: Total XP earned

### Mode 3: Race to 5 Bingos
- First to 5 bingos wins
- Game ends immediately
- High-intensity mode

---

## 📦 Services Architecture

```
src/services/
├── DiscoveredLiveService.ts          (existing - single player)
├── multiplayer/
│   ├── MultiplayerGameService.ts     (room management)
│   ├── AIAgentService.ts             (bot logic)
│   ├── GameModeRegistry.ts           (mode system)
│   ├── RealtimeService.ts            (WebSocket wrapper)
│   └── modes/
│       ├── ClassicBingoMode.ts
│       ├── RaceTo5BingosMode.ts
│       └── TeamBingoMode.ts
└── shared/
    └── BingoLogic.ts                 (shared between single/multi)
```

---

## 🎨 UI Components

### New Components Needed

```
src/components/discovered-live/multiplayer/
├── DiscoveredLiveRoomLobby.tsx       (waiting room)
├── DiscoveredLiveMultiQuestion.tsx   (question with player status)
├── DiscoveredLivePlayerCard.tsx      (player avatar + progress)
├── DiscoveredLiveMultiGrid.tsx       (grid with all player highlights)
├── DiscoveredLiveLeaderboard.tsx     (live rankings)
└── DiscoveredLiveMultiResults.tsx    (final standings)
```

### Room Lobby Mockup

```
┌─────────────────────────────────────────────────┐
│  DISCOVERED LIVE! - ROOM ABC123                 │
├─────────────────────────────────────────────────┤
│                                                  │
│  👤 You (Test Student)          [READY] ✓       │
│  ⚡ QuickBot                     [AI] ✓          │
│  🎯 SteadyBot                    [AI] ✓          │
│  🧠 ThinkBot                     [AI] ✓          │
│                                                  │
│  Players: 4/4  •  Mode: Classic Bingo           │
│                                                  │
│  [Starting in 3 seconds...]                     │
└─────────────────────────────────────────────────┘
```

### Multi-Player Question Screen Mockup

```
┌─────────────────────────────────────────────────┐
│  Question 5/20                    ⏱️ 12s        │
├─────────────────────────────────────────────────┤
│                                                  │
│  💡 This career uses letters to write stories   │
│     and books for people to read.               │
│                                                  │
│  [A] 📚 Librarian                               │
│  [B] ✍️ Writer          ← Your answer           │
│  [C] 👨‍🏫 Teacher                                │
│  [D] 📰 Journalist                              │
│                                                  │
├─────────────────────────────────────────────────┤
│  PLAYER STATUS:                                  │
│                                                  │
│  👤 You        3 unlocked   1 bingo  ✅ Answered│
│  ⚡ QuickBot   4 unlocked   1 bingo  ✅ Answered│
│  🎯 SteadyBot  2 unlocked   0 bingo  ⏳ Thinking│
│  🧠 ThinkBot   5 unlocked   2 bingo  ⏳ Thinking│
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Implementation Phases

### Phase 1: Core Multiplayer Infrastructure (Week 1-2)
- [ ] Create database tables (dl_game_rooms, dl_room_participants, etc.)
- [ ] Build MultiplayerGameService
- [ ] Implement WebSocket integration with Supabase Realtime
- [ ] Create room creation/joining logic
- [ ] Test basic room lifecycle

### Phase 2: AI Agent System (Week 2-3)
- [ ] Build AIAgentService
- [ ] Implement AI decision-making algorithms
- [ ] Create AI personality presets
- [ ] Add AI agent spawning logic
- [ ] Test AI agents in isolated rooms

### Phase 3: Game Mode System (Week 3-4)
- [ ] Design GameMode interface
- [ ] Extract shared bingo logic
- [ ] Implement ClassicBingoMode
- [ ] Create GameModeRegistry
- [ ] Test mode switching

### Phase 4: UI Components (Week 4-5)
- [ ] Build lobby screen
- [ ] Build multiplayer question screen
- [ ] Build player status cards
- [ ] Build multiplayer results screen
- [ ] Add real-time animations

### Phase 5: Integration & Testing (Week 5-6)
- [ ] You vs 3 AI agents testing
- [ ] Fix bugs and edge cases
- [ ] Performance optimization
- [ ] Load testing with multiple rooms
- [ ] Documentation

---

## ✅ Success Criteria

### Must Have
- [x] Human player can create a room
- [x] 3 AI agents auto-join and fill slots
- [x] All players share the same 5x5 grid
- [x] Each player unlocks their own squares
- [x] Bingo detection works correctly for all players
- [x] Real-time updates via WebSocket
- [x] Game completes with accurate winner
- [x] AI agents show realistic behavior

### Nice to Have
- [ ] Spectator mode
- [ ] Replay system
- [ ] Room chat
- [ ] Custom AI difficulty
- [ ] Tournament brackets

---

## 📈 Next Steps

1. **Review this design** - Get your feedback
2. **Start with database schema** - Create migration for new tables
3. **Build AIAgentService** - Core bot logic first
4. **Create test room** - "You vs 3 Bots" scenario
5. **Iterate based on testing** - Refine AI behavior and game flow

---

**Questions to Decide:**

1. **Shared vs Individual Grids?**
   - Shared: All players see same grid, compete to unlock squares first
   - Individual: Each player has unique grid, pure race

2. **Answer Reveal Timing?**
   - Show answers as they come in (live updates)
   - Wait for all answers then reveal together

3. **Bingo Celebration?**
   - Pause game to celebrate each bingo
   - Show celebration but keep game moving

4. **AI Difficulty Balance?**
   - Fixed difficulties (easy/medium/hard)
   - Adaptive difficulty based on your performance

**What would you like to tackle first?**
