# Career Match - Memory Matching Game Design

## 🎮 Game Overview

**Category:** QuickPlay (Discovered Live Arcade)
**Type:** Multiplayer Turn-Based Memory/Matching Game
**Players:** 2-6 players (with AI fill)
**Duration:** 5-10 minutes
**Skill Focus:** Memory, Concentration, Career Exploration

---

## 🎯 Core Concept

Players take turns flipping two cards face-up to find matching pairs of career roles. When a match is found, the player earns points and takes another turn. The player with the most matches wins!

**Educational Hook:** "Discover careers while sharpening your memory skills!"

---

## 🖼️ Visual Assets

**Available:** 50 career role images in landscape format
- Location: `/public/assets/Discovered Live/Role - Landscape/`
- Examples: Talent Scout, Content Creator, Team Manager, Social Media Manager, Psychologist, Game Designer, 3D Artist, etc.

**Card Design:**
- Front: Career role image with name banner
- Back: Pathfinity/Discovered Live branded design
- Flip animation: 3D card flip effect

---

## 📊 Game Modes

### Easy Mode
- **Cards:** 12 cards (6 pairs)
- **Grid:** 3×4 or 4×3
- **Time Limit:** None (or 90 seconds)
- **Ideal For:** K-5 students

### Medium Mode
- **Cards:** 20 cards (10 pairs)
- **Grid:** 4×5 or 5×4
- **Time Limit:** 5 minutes
- **Ideal For:** 6-8 students

### Hard Mode
- **Cards:** 30 cards (15 pairs)
- **Grid:** 5×6 or 6×5
- **Time Limit:** 8 minutes
- **Ideal For:** 9-12 students

---

## 🎲 Gameplay Flow

### 1. Pre-Game (Lobby)
```
┌─────────────────────────────────────┐
│  CAREER MATCH - Lobby               │
├─────────────────────────────────────┤
│  Players Joined: 3/6                │
│  ✅ Sam (Host)                      │
│  ✅ Alex                            │
│  ✅ Jordan                          │
│  ⏳ Waiting...                      │
│                                     │
│  Difficulty: [Easy] Medium  Hard    │
│  [Start Game] [Invite Friends]      │
└─────────────────────────────────────┘
```

**Features:**
- Real-time player join notifications
- Host can select difficulty
- AI players fill empty slots (optional)
- Minimum 2 players to start

---

### 2. Game Start
```
┌─────────────────────────────────────┐
│  🎴 Career Match - Medium Mode      │
├─────────────────────────────────────┤
│  Leaderboard:                       │
│  🥇 Sam: 3 matches                  │
│  🥈 Alex: 2 matches                 │
│  🥉 Jordan: 1 match                 │
│                                     │
│  Current Turn: 👤 Sam               │
│  Time Remaining: 4:23               │
└─────────────────────────────────────┘

┌───────────────────────────────────────┐
│  [?] [?] [?] [?] [?]                  │
│  [?] [?] [?] [?] [?]                  │
│  [?] [?] [?] [?] [?]                  │
│  [?] [?] [?] [?] [?]                  │
└───────────────────────────────────────┘
```

**Turn Sequence:**
1. **Turn Indicator:** Highlight whose turn it is
2. **First Card Flip:** Player clicks a card → reveals career image
3. **Second Card Flip:** Player clicks another card → reveals career image
4. **Match Check:**
   - ✅ **Match Found:** Cards stay face-up, player gets +1 point, takes another turn
   - ❌ **No Match:** Cards flip back after 2 seconds, next player's turn

---

### 3. Match Found Animation
```
✨ MATCH FOUND! ✨
[Talent Scout] + [Talent Scout]
Sam earned +1 point!
+50 Arcade XP (5 PathIQ XP)
🎯 Sam goes again!
```

**Celebration:**
- Sparkle effect around matched cards
- Sound effect (success chime)
- Cards remain face-up with subtle glow
- XP counter animates: +50 Arcade XP

---

### 4. Game End
```
┌─────────────────────────────────────┐
│  🏆 GAME COMPLETE!                  │
├─────────────────────────────────────┤
│  🥇 Sam - 5 matches (450 Arcade XP) │
│     • Match XP: 250                 │
│     • Winner Bonus: 200             │
│     → 45 PathIQ XP earned!          │
│                                     │
│  🥈 Alex - 3 matches (250 XP)       │
│     • Match XP: 150                 │
│     • 2nd Place: 100                │
│     → 25 PathIQ XP earned!          │
│                                     │
│  🥉 Jordan - 2 matches (150 XP)     │
│     • Match XP: 100                 │
│     • 3rd Place: 50                 │
│     → 15 PathIQ XP earned!          │
│                                     │
│  Total Careers Discovered: 10       │
│  Best Memory Streak: 3 (Sam) 🔥     │
│                                     │
│  [Play Again] [View Careers] [Exit] │
└─────────────────────────────────────┘
```

---

## 🎮 Game Mechanics

### Turn Rules
1. **Active Player** can flip 2 cards per turn
2. **Other Players** watch and remember card positions
3. **Turn Timeout:** 30 seconds to make both flips (or auto-skip)
4. **Bonus Turn:** Matching earns another turn
5. **Max Streak:** No limit on consecutive matches

### Scoring System
```javascript
// In-Game Scoring (for leaderboard during match)
Match Found = +1 point (game score only)

// Arcade XP (converts 10:1 to PathIQ XP)
Match Bonus = +50 Arcade XP (= 5 PathIQ XP) per match
Winning Bonus = +200 XP (1st), +100 XP (2nd), +50 XP (3rd) (= 20, 10, 5 PathIQ XP)
Perfect Memory (no misses) = +500 XP bonus (= 50 PathIQ XP)
Memory Streak (3+ consecutive matches) = +100 XP bonus (= 10 PathIQ XP)

// Example Game Earnings:
// - 5 matches found = 250 Arcade XP (25 PathIQ XP)
// - 1st place bonus = 200 Arcade XP (20 PathIQ XP)
// - Total = 450 Arcade XP (45 PathIQ XP) for winner
```

### Special Rules
- **First Match Bonus:** First player to find a match gets +50 Arcade XP (5 PathIQ XP)
- **Memory Streak:** 3+ consecutive matches = "Memory Master!" badge + 100 XP bonus
- **Time Pressure:** Last 60 seconds = 2x XP for matches (100 XP per match instead of 50)

---

## 🔧 Technical Architecture

### Database Schema

#### `career_match_rooms` Table
```sql
CREATE TABLE career_match_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_code VARCHAR(6) UNIQUE NOT NULL,
  host_user_id UUID REFERENCES auth.users(id),
  difficulty VARCHAR(10) NOT NULL, -- 'easy', 'medium', 'hard'
  max_players INTEGER DEFAULT 6,
  status VARCHAR(20) DEFAULT 'waiting', -- 'waiting', 'active', 'completed'
  game_data JSONB, -- Card positions, matched pairs, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ
);
```

#### `career_match_players` Table
```sql
CREATE TABLE career_match_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES career_match_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  display_name VARCHAR(100) NOT NULL,
  is_ai_player BOOLEAN DEFAULT FALSE,
  matches_found INTEGER DEFAULT 0,
  turn_order INTEGER NOT NULL,
  is_active_turn BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `career_match_moves` Table
```sql
CREATE TABLE career_match_moves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES career_match_rooms(id) ON DELETE CASCADE,
  player_id UUID REFERENCES career_match_players(id),
  card_1_position INTEGER NOT NULL,
  card_2_position INTEGER NOT NULL,
  is_match BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `career_match_cards` Table
```sql
CREATE TABLE career_match_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES career_match_rooms(id) ON DELETE CASCADE,
  position INTEGER NOT NULL, -- 0-indexed grid position
  career_name VARCHAR(100) NOT NULL,
  career_image_path TEXT NOT NULL,
  is_revealed BOOLEAN DEFAULT FALSE,
  matched_by_player_id UUID REFERENCES career_match_players(id),
  matched_at TIMESTAMPTZ
);
```

---

### Realtime Events (Supabase)

```typescript
// Event types for realtime sync
type CareerMatchEvent =
  | { type: 'player_joined', data: Player }
  | { type: 'player_left', data: { playerId: string } }
  | { type: 'game_started', data: { cards: CardState[] } }
  | { type: 'card_flipped', data: { position: number, cardId: string } }
  | { type: 'match_found', data: { playerId: string, card1: number, card2: number } }
  | { type: 'no_match', data: { card1: number, card2: number } }
  | { type: 'turn_changed', data: { nextPlayerId: string } }
  | { type: 'game_ended', data: { winners: Player[] } };
```

---

### Service Architecture

```
CareerMatchService.ts
├── createRoom(difficulty, hostId) → roomCode
├── joinRoom(roomCode, userId) → success
├── startGame(roomId) → cardLayout
├── flipCard(roomId, playerId, position) → cardData
├── checkMatch(roomId, card1, card2) → isMatch
├── endTurn(roomId, playerId) → nextPlayer
└── getLeaderboard(roomId) → rankings

CareerMatchRealtimeService.ts
├── subscribeToRoom(roomId, callbacks)
├── unsubscribeFromRoom(roomId)
├── broadcastCardFlip(roomId, cardData)
├── broadcastMatch(roomId, matchData)
└── broadcastTurnChange(roomId, nextPlayer)

AIPlayerService.ts (Reuse from Career Bingo)
├── generateAIMove(gameState) → {card1, card2}
├── simulateThinking(difficulty) → delay
└── makeMove(roomId, aiPlayerId)
```

### System Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CAREER MATCH GAME                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐    ┌──────────────────┐                 │
│  │ CareerMatchService│    │ CareerMatchRealtimeService         │
│  │                  │◄──►│                  │                  │
│  └────────┬─────────┘    └────────┬─────────┘                  │
│           │                       │                             │
│           ▼                       ▼                             │
│  ┌────────────────────────────────────────────┐                │
│  │         Supabase Database                  │                │
│  │  • career_match_rooms                      │                │
│  │  • career_match_players                    │                │
│  │  • career_match_cards                      │                │
│  │  • career_match_moves                      │                │
│  └────────────────────────────────────────────┘                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                           │
                           │ integrates with
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│ AI Player Pool│  │ MasterSound   │  │ Global        │
│ Service       │  │ System        │  │ Leaderboard   │
├───────────────┤  ├───────────────┤  ├───────────────┤
│ • Alex        │  │ 🎵 Background │  │ • All-Time    │
│ • Jordan      │  │    Music      │  │   Rankings    │
│ • Taylor      │  │ 🔊 Card Flip  │  │ • Weekly      │
│ • Morgan      │  │ 🔊 Match      │  │   Rankings    │
│ • Casey       │  │ 🔊 Mismatch   │  │ • Personal    │
│ • Riley       │  │ 🔊 Streak     │  │   Stats       │
│ • Avery       │  │ 🔊 Complete   │  │ • Achievements│
│ • Quinn       │  │               │  │               │
└───────────────┘  └───────────────┘  └───────────────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │   Career Match UI    │
                │  ┌────────────────┐  │
                │  │  Game Board    │  │
                │  │  🎴 Cards      │  │
                │  │  🏆 Leaderboard│  │
                │  │  👥 Players    │  │
                │  │  ⏱️  Timer     │  │
                │  └────────────────┘  │
                └──────────────────────┘
```

**Data Flow Example:**

1. **Game Start:**
   - `CareerMatchService.createRoom()` → Creates room in DB
   - `AIPlayerPoolService.assignAIPlayers()` → Fills room with AI
   - `MasterSoundSystem.playBackgroundMusic('career-match-theme')` → Starts music
   - `GlobalLeaderboardService.initializeGameSession()` → Tracks game start

2. **Player Turn:**
   - Player clicks card → `CareerMatchService.flipCard()` → Updates DB
   - `MasterSoundSystem.play('card-flip')` → Plays sound
   - `CareerMatchRealtimeService.broadcastCardFlip()` → Syncs to all players

3. **Match Found:**
   - `CareerMatchService.checkMatch()` → Validates match
   - `MasterSoundSystem.play('match-success')` → Plays celebration sound
   - Updates player score in DB
   - `CareerMatchRealtimeService.broadcastMatch()` → Syncs leaderboard

4. **AI Turn:**
   - `AIPlayerPoolService.processAITurn()` → Generates AI move
   - AI memory simulation (30%/60%/90% accuracy)
   - Natural delay (2-5 seconds)
   - Same flow as human player

5. **Game End:**
   - `CareerMatchService.completeGame()` → Calculate final scores
   - `GlobalLeaderboardService.updateLeaderboard()` → Update rankings
   - `MasterSoundSystem.play('game-complete')` → Victory sound
   - Display completion screen with XP breakdown

---

## 🔊 MasterSoundSystem Integration

Career Match integrates with the centralized `MasterSoundSystem` for all audio (music and sound effects).

### Background Music
```typescript
// Play background music when game starts
MasterSoundSystem.playBackgroundMusic('career-match-theme');

// Music track: Upbeat, playful, concentration-friendly
// Volume: 0.3 (lower than menu music to not distract)
// Loop: Seamless (no gap)
```

**Music Selection:**
- Use existing arcade music or create new "memory game" track
- Should be non-distracting, low-tempo (120-130 BPM)
- Fades out during match celebrations

### Sound Effects

```typescript
// Card flip sounds
MasterSoundSystem.play('card-flip', { volume: 0.4 });

// Match found (success)
MasterSoundSystem.play('match-success', { volume: 0.6 });

// No match (gentle failure sound)
MasterSoundSystem.play('card-mismatch', { volume: 0.3 });

// Turn change
MasterSoundSystem.play('turn-change', { volume: 0.35 });

// Game complete
MasterSoundSystem.play('game-complete', { volume: 0.5 });

// Memory streak achievement
MasterSoundSystem.play('streak-bonus', { volume: 0.7 });
```

### Sound Event Mapping

| Game Event | Sound Effect | Volume | Notes |
|------------|-------------|---------|-------|
| **Card Flip** | `card-flip` | 0.4 | Quick whoosh sound |
| **Match Found** | `match-success` | 0.6 | Positive chime (Career Bingo success bell) |
| **No Match** | `card-mismatch` | 0.3 | Gentle "wrong" sound |
| **Turn Change** | `turn-change` | 0.35 | Soft notification |
| **Game Start** | `game-start` | 0.5 | Opening fanfare |
| **Game Complete** | `game-complete` | 0.5 | Victory music |
| **Memory Streak (3+)** | `streak-bonus` | 0.7 | Special achievement sound |
| **Time Warning (60s left)** | `time-warning` | 0.4 | Urgent clock tick |

### Implementation Example

```typescript
// In CareerMatchGameBoard.tsx
import { MasterSoundSystem } from '@/services/MasterSoundSystem';

const handleCardFlip = async (position: number) => {
  // Play flip sound
  MasterSoundSystem.play('card-flip');

  // Flip card logic...

  if (isMatch) {
    // Play success sound
    MasterSoundSystem.play('match-success');

    // Check for streak
    if (consecutiveMatches >= 3) {
      MasterSoundSystem.play('streak-bonus');
    }
  } else {
    // Play mismatch sound (after 1.5s delay to see both cards)
    setTimeout(() => {
      MasterSoundSystem.play('card-mismatch');
    }, 1500);
  }
};

// On game start
useEffect(() => {
  if (gameStatus === 'active') {
    MasterSoundSystem.playBackgroundMusic('career-match-theme');
    MasterSoundSystem.play('game-start');
  }

  return () => {
    MasterSoundSystem.stopBackgroundMusic();
  };
}, [gameStatus]);
```

---

## 🤖 AI Player Pool Integration

Career Match uses the **centralized AI Player Pool** (same system as Career Bingo, CEO Takeover, Decision Desk).

### AI Player Behavior

**Memory Simulation:**
- AI players maintain a "memory" of revealed cards
- Memory accuracy depends on difficulty:
  - **Easy AI:** 30% memory retention (often forgets)
  - **Medium AI:** 60% memory retention (remembers some)
  - **Hard AI:** 90% memory retention (almost perfect recall)

**Turn Timing:**
```typescript
// AI thinks for 2-5 seconds before making a move
const thinkingDelay = Math.random() * 3000 + 2000; // 2-5s

// Natural variation in decision speed
const isConfidentMove = aiMemory.has(card1) && aiMemory.has(card2);
const delay = isConfidentMove ? 2000 : 4000; // Quick if confident, slow if guessing
```

### AI Decision Logic

```typescript
class CareerMatchAI {
  private memory: Map<number, string> = new Map(); // position → career_name
  private difficulty: 'easy' | 'medium' | 'hard';

  generateMove(gameState: GameState): [number, number] {
    // 1. Check if AI knows a match
    const knownMatch = this.findKnownMatch();
    if (knownMatch) {
      return knownMatch;
    }

    // 2. Flip one known card + guess
    const knownCard = this.getRandomKnownCard();
    if (knownCard && Math.random() < this.memoryAccuracy) {
      const guessCard = this.pickUnknownCard(gameState);
      return [knownCard.position, guessCard];
    }

    // 3. Random guess (no memory)
    return this.pickTwoRandomCards(gameState);
  }

  rememberCard(position: number, careerName: string) {
    // Forget cards based on difficulty
    if (Math.random() > this.memoryAccuracy) {
      return; // Forgot!
    }
    this.memory.set(position, careerName);
  }

  get memoryAccuracy(): number {
    switch (this.difficulty) {
      case 'easy': return 0.3;
      case 'medium': return 0.6;
      case 'hard': return 0.9;
    }
  }
}
```

### AI Player Pool Usage

```typescript
// In CareerMatchService.ts
import { AIPlayerPoolService } from '@/services/AIPlayerPoolService';

async createRoom(difficulty: Difficulty, hostId: string) {
  const room = await createRoomInDB(difficulty, hostId);

  // Fill with AI players if needed
  const humanPlayerCount = 1; // Just the host initially
  const targetPlayers = 4; // Default room size
  const aiPlayersNeeded = targetPlayers - humanPlayerCount;

  // Get AI players from centralized pool
  const aiPlayers = await AIPlayerPoolService.assignAIPlayers(
    room.id,
    'career-match',
    aiPlayersNeeded,
    difficulty
  );

  // Add AI players to room
  for (const aiPlayer of aiPlayers) {
    await addPlayerToRoom(room.id, aiPlayer);
  }

  return room;
}

// When AI player's turn
async processAITurn(roomId: string, aiPlayerId: string) {
  const gameState = await getGameState(roomId);
  const aiPlayer = await getAIPlayer(aiPlayerId);

  // Get AI's move decision
  const [card1Pos, card2Pos] = aiPlayer.generateMove(gameState);

  // Simulate thinking time
  await delay(aiPlayer.thinkingDelay);

  // Execute move
  await flipCard(roomId, aiPlayerId, card1Pos);
  await delay(800); // Pause between flips
  await flipCard(roomId, aiPlayerId, card2Pos);

  // AI remembers revealed cards (with memory limitations)
  aiPlayer.rememberCard(card1Pos, gameState.cards[card1Pos].name);
  aiPlayer.rememberCard(card2Pos, gameState.cards[card2Pos].name);
}
```

### AI Player Names (from Centralized Pool)
- Alex
- Jordan
- Taylor
- Morgan
- Casey
- Riley
- Avery
- Quinn

**Note:** These are the same AI players used across all Discovered Live games, maintaining consistency.

---

## 🏆 Global Leaderboard Integration

Career Match integrates with the **Discovered Live Global Leaderboard** system.

### Leaderboard Metrics

```typescript
interface CareerMatchLeaderboardEntry {
  game_type: 'career-match';
  player_id: string;
  display_name: string;

  // Primary metrics
  total_matches_found: number;      // Career-long stat
  total_games_played: number;
  total_wins: number;               // 1st place finishes

  // Performance metrics
  win_rate: number;                 // wins / games_played
  average_matches_per_game: number;
  perfect_memory_games: number;     // Games with no misses
  memory_streak_record: number;     // Longest consecutive match streak

  // XP and ranking
  total_arcade_xp: number;
  total_pathiq_xp: number;
  global_rank: number;

  // Timestamps
  last_played: Date;
  first_played: Date;
}
```

### Leaderboard Tables

**Global Leaderboard (All-Time)**
```sql
-- Query: Top 100 Career Match players by total XP
SELECT
  player_id,
  display_name,
  total_matches_found,
  total_wins,
  win_rate,
  total_arcade_xp,
  global_rank
FROM discovered_live_leaderboard
WHERE game_type = 'career-match'
ORDER BY total_arcade_xp DESC
LIMIT 100;
```

**Weekly Leaderboard**
```sql
-- Reset every Monday at midnight
SELECT
  player_id,
  display_name,
  SUM(matches_found) AS weekly_matches,
  SUM(arcade_xp_earned) AS weekly_xp
FROM career_match_game_history
WHERE completed_at >= date_trunc('week', NOW())
GROUP BY player_id, display_name
ORDER BY weekly_xp DESC
LIMIT 50;
```

### Updating Leaderboard After Game

```typescript
// In CareerMatchService.ts
async completeGame(roomId: string) {
  const results = await calculateFinalScores(roomId);

  // Update global leaderboard for each player
  for (const player of results.players) {
    if (!player.is_ai_player) {
      await updateGlobalLeaderboard({
        game_type: 'career-match',
        player_id: player.user_id,
        display_name: player.display_name,

        // Increment totals
        total_matches_found: player.matches_found,
        total_games_played: 1,
        total_wins: player.rank === 1 ? 1 : 0,
        perfect_memory_games: player.misses === 0 ? 1 : 0,

        // XP earned
        arcade_xp_earned: player.total_arcade_xp,
        pathiq_xp_earned: player.total_arcade_xp / 10,

        // Update streaks
        memory_streak_record: Math.max(
          player.longest_streak,
          existing_record
        ),

        // Timestamps
        last_played: new Date()
      });
    }
  }

  // Recalculate global ranks
  await recalculateGlobalRanks('career-match');
}
```

### Leaderboard Display in Game

```typescript
// In-game leaderboard (during match)
<GameLeaderboard>
  <LeaderboardEntry rank={1} player="Sam" matches={5} />
  <LeaderboardEntry rank={2} player="Alex" matches={3} />
  <LeaderboardEntry rank={3} player="Jordan" matches={2} />
</GameLeaderboard>

// Global leaderboard (post-game screen)
<GlobalLeaderboardModal game="career-match">
  <TabPanel label="All-Time">
    {/* Top 100 players by total XP */}
  </TabPanel>
  <TabPanel label="Weekly">
    {/* Top 50 players this week */}
  </TabPanel>
  <TabPanel label="Your Stats">
    {/* Player's personal stats and rank */}
  </TabPanel>
</GlobalLeaderboardModal>
```

### Personal Stats Tracking

```typescript
interface PlayerCareerMatchStats {
  // Overview
  games_played: number;
  total_playtime: string; // "2h 34m"

  // Performance
  win_rate: number; // 0.65 = 65%
  average_matches: number; // 4.2 per game
  total_matches_found: number; // 127

  // Records
  best_game_matches: number; // 8 matches
  longest_memory_streak: number; // 5 consecutive
  perfect_memory_games: number; // 3

  // Rankings
  global_rank: number; // #42 out of 1,250 players
  percentile: number; // Top 3%

  // XP Progress
  total_arcade_xp: number; // 4,280
  total_pathiq_xp: number; // 428
  next_rank_threshold: number; // 5,000 XP
}
```

### Leaderboard Achievements

```typescript
// Unlock achievements based on leaderboard performance
const achievements = [
  {
    id: 'memory-master',
    name: 'Memory Master',
    condition: 'Reach top 100 global leaderboard',
    reward: '+500 bonus XP'
  },
  {
    id: 'perfect-recall',
    name: 'Perfect Recall',
    condition: 'Complete 5 games with perfect memory (no misses)',
    reward: '+250 bonus XP'
  },
  {
    id: 'career-explorer',
    name: 'Career Explorer',
    condition: 'Match all 50 unique career cards',
    reward: '+1000 bonus XP'
  },
  {
    id: 'win-streak',
    name: 'Unstoppable',
    condition: 'Win 5 games in a row',
    reward: '+750 bonus XP'
  }
];
```

---

## 🎨 UI Components

### Main Game Board
```typescript
<CareerMatchGameBoard
  cards={cardStates}
  currentPlayerId={activePlayer.id}
  onCardClick={(position) => handleCardFlip(position)}
  difficulty={difficulty}
/>
```

### Player Panel
```typescript
<CareerMatchPlayerPanel
  players={players}
  currentTurn={activePlayer}
  showTurnIndicator={true}
/>
```

### Match Animation
```typescript
<MatchCelebration
  career1={matchedCard1.name}
  career2={matchedCard2.name}
  playerName={activePlayer.name}
  xpEarned={10}
/>
```

---

## 🎯 Success Metrics

### Gameplay Metrics
- Average game duration: 5-8 minutes
- Player retention: 70%+ play 2+ games
- Match accuracy: Track memory improvement over sessions

### Educational Metrics
- Careers discovered per game: 6-15
- Career image recognition improvement
- Player curiosity (clicks on "View Careers")

### Engagement Metrics
- Daily active players
- Games per session
- Multiplayer fill rate (human vs AI)

---

## 🚀 Development Phases

### Phase 1: Core Game (Week 1)
- ✅ Database schema and migrations
- ✅ Card shuffling and layout algorithm
- ✅ Single-player gameplay loop
- ✅ Match validation logic
- ✅ Basic UI with flip animations

### Phase 2: Multiplayer (Week 2)
- ✅ Room creation and joining
- ✅ Realtime synchronization
- ✅ Turn management
- ✅ Live leaderboard updates
- ✅ Player presence indicators

### Phase 3: AI Players (Week 3)
- ✅ AI decision-making (memory simulation)
- ✅ Difficulty-based AI (easy/medium/hard)
- ✅ Auto-fill rooms with AI
- ✅ Natural timing delays

### Phase 4: Polish & Launch (Week 4)
- ✅ Sound effects and music
- ✅ Match celebration animations
- ✅ Career info cards
- ✅ Achievements and badges
- ✅ Integration with Discovered Live Arcade

---

## 💡 Future Enhancements

### Career Education
- **Career Spotlight:** After each match, show fun fact about the career
- **Career Collection:** Players build a "discovered careers" portfolio
- **Learning Path:** "Learn more about this career" button

### Power-Ups (Optional)
- **Peek:** Reveal any card for 2 seconds (1 use per game)
- **Second Chance:** If no match, flip one card back (1 use)
- **Memory Boost:** All cards revealed for 3 seconds at game start

### Social Features
- **Team Mode:** 2v2 or 3v3 teams
- **Daily Challenge:** Specific career pairs for bonus XP
- **Leaderboards:** Global rankings, weekly champions

### Customization
- **Card Backs:** Unlock different designs
- **Themes:** Different visual themes (esports, medical, tech, etc.)
- **Grid Sizes:** Custom difficulty with any even number of cards

---

## 🎮 Similar to Career Bingo

| Feature | Career Bingo | Career Match |
|---------|--------------|--------------|
| **Multiplayer** | ✅ Real-time | ✅ Turn-based |
| **AI Players** | ✅ Pool system | ✅ Same pool |
| **Duration** | 10-15 min | 5-10 min |
| **Rooms** | Perpetual | On-demand |
| **Learning** | Q&A | Visual memory |
| **Competition** | First to bingo | Most matches |

---

## 📝 Implementation Checklist

### Database
- [ ] Create `career_match_rooms` table
- [ ] Create `career_match_players` table
- [ ] Create `career_match_cards` table
- [ ] Create `career_match_moves` table
- [ ] Add RLS policies
- [ ] Create indices for performance

### Backend Services
- [ ] `CareerMatchService.ts` - Game logic
- [ ] `CareerMatchRealtimeService.ts` - Multiplayer sync
- [ ] Card shuffling algorithm
- [ ] Match validation
- [ ] Turn management
- [ ] Scoring system

### Frontend Components
- [ ] `CareerMatchLobby.tsx` - Waiting room
- [ ] `CareerMatchGameBoard.tsx` - Main game grid
- [ ] `CareerMatchCard.tsx` - Flippable card component
- [ ] `CareerMatchPlayerPanel.tsx` - Leaderboard sidebar
- [ ] `CareerMatchCompletionScreen.tsx` - End game summary
- [ ] Card flip animation (CSS/Framer Motion)
- [ ] Match celebration overlay

### Integration
- [ ] Add to Discovered Live Arcade
- [ ] Add to QuickPlay category
- [ ] **Connect to centralized AI Player Pool**
  - [ ] Import `AIPlayerPoolService`
  - [ ] Auto-fill rooms with AI players
  - [ ] Implement AI memory simulation (30%/60%/90% accuracy)
  - [ ] Add AI turn processing with natural delays
- [ ] **Integrate MasterSoundSystem**
  - [ ] Add background music (`career-match-theme`)
  - [ ] Implement card flip sound (`card-flip`)
  - [ ] Add match success sound (`match-success`)
  - [ ] Add mismatch sound (`card-mismatch`)
  - [ ] Add turn change sound (`turn-change`)
  - [ ] Add game start/complete sounds
  - [ ] Add memory streak bonus sound (`streak-bonus`)
  - [ ] Add time warning sound (60s remaining)
- [ ] **Connect to Global Leaderboard**
  - [ ] Update leaderboard after each game
  - [ ] Track total matches found, wins, win rate
  - [ ] Record perfect memory games and streaks
  - [ ] Display global and weekly leaderboards
  - [ ] Show personal stats and rankings
  - [ ] Implement leaderboard achievements

### Testing
- [ ] Single-player gameplay
- [ ] 2-player multiplayer
- [ ] 6-player full room
- [ ] AI player behavior
- [ ] Edge cases (disconnects, timeouts)
- [ ] Performance (card flip lag)

---

## 🎨 Visual Mockup (Text)

```
┌────────────────────────────────────────────────────────────────────┐
│  CAREER MATCH 🎴                                 Time: 4:23 ⏱️     │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │    ?     │  │  TALENT  │  │    ?     │  │    ?     │          │
│  │          │  │  SCOUT   │  │          │  │          │          │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘          │
│                                                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │    ?     │  │    ?     │  │    ?     │  │ CONTENT  │          │
│  │          │  │          │  │          │  │ CREATOR  │          │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘          │
│                                                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │    ?     │  │    ?     │  │    ?     │  │    ?     │          │
│  │          │  │          │  │          │  │          │          │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘          │
│                                                                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │  TALENT  │  │    ?     │  │    ?     │  │    ?     │          │
│  │  SCOUT   │  │          │  │          │  │          │          │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘          │
│                                                                    │
│  👤 Current Turn: Sam (You) ⭐                                     │
│                                                                    │
│  LEADERBOARD:                                                      │
│  🥇 Sam: 3 matches 🔥                                              │
│  🥈 Alex: 2 matches                                                │
│  🥉 Jordan: 1 match                                                │
└────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Game Name Options

1. **Career Match** (Simple, clear)
2. **Memory Match: Careers Edition**
3. **Role Recall** (Clever wordplay)
4. **Career Pairs** (Descriptive)
5. **The Matching Game** (Generic)

**Recommendation:** **"Career Match"** - Short, memorable, clear purpose

---

## 🚀 Next Steps

1. **Approve Game Design** - Review and finalize concept
2. **Create Database Migrations** - Set up tables and policies
3. **Build Core Services** - Game logic and realtime sync
4. **Develop UI Components** - Game board and cards
5. **Test Multiplayer** - Verify realtime functionality
6. **Add AI Players** - Integrate with AI player pool
7. **Polish & Launch** - Animations, sounds, and arcade integration

---

**Estimated Development Time:** 3-4 weeks
**Complexity:** Medium (similar to Career Bingo)
**Educational Value:** High (career discovery + memory skills)
**Fun Factor:** Very High (classic game, competitive, quick rounds)

🎮 **Ready to start building?**
