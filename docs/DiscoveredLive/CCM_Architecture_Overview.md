# Career Challenge Multiplayer (CCM) - Architecture Overview

**Created:** October 16, 2025
**Status:** In Development
**Version:** 1.0

---

## 🎯 Overview

**Career Challenge Multiplayer (CCM)** is a perpetual room-based multiplayer game mode that runs continuously 24/7, allowing players to drop in and out between games. This is distinct from the existing **Career Challenge (CC)** single-player/lobby mode.

---

## 🏗️ Architecture Comparison

### **CC (Existing) - Lobby-Based Single Player**
- **Route:** `/discovered-live/career-challenge`
- **Tables:** `cc_*` prefix
- **Flow:** Choose Industry → Create/Join Room → Wait for Players → Play Game → End
- **Model:** Traditional lobby system with defined start/end
- **Status:** ✅ Working, in production

### **CCM (New) - Perpetual Multiplayer Rooms**
- **Route:** `/discovered-live/career-challenge-multiplayer`
- **Tables:** `ccm_*` prefix
- **Flow:** Browse Featured Rooms → Join Active Room → Drop into Current/Next Game → Play → Cycle Continues
- **Model:** Always-on rooms like Career Bingo perpetual rooms
- **Status:** 🚧 In Development

---

## 🎮 Core Concepts

### **Perpetual Rooms (Trigger-Based Activation)**
- Rooms **activate when players join** (resource-efficient)
- Games cycle continuously while players are present: `Game → 15s Intermission → Next Game`
- Rooms go **dormant when empty** (no unnecessary AI games)
- Featured rooms displayed on hub (Global Room, Skills Room, etc.)
- Room codes like `CCM_GLOBAL01`, `CCM_SKILLS01`

### **Game Sessions (5 Rounds)**
- Each game is exactly **5 rounds**
- New game starts automatically after 15-second intermission
- Game number increments: Game #1, Game #2, Game #3...
- Player scores tracked per game

### **Drop-In/Drop-Out**
- Players can join **during intermission** (not mid-game)
- Players can leave anytime
- **AI players fill empty seats** automatically when humans are present
- Minimum 2 players (1 human + AI) to start
- Room goes dormant when last human leaves (no wasted resources)

### **Round Flow (60s per round)**
1. Challenge Card revealed (People, Product, Process, Place, Promotion, or Price)
2. Player chooses C-Suite lens (Round 1 only: CEO, CFO, CMO, CTO, CHRO)
3. Player selects Role card (from hand of 10)
4. Player optionally selects Synergy card (from hand of 5)
5. Player optionally plays Golden card (once per game) OR MVP card (from previous round)
6. Lock in selection
7. Scoring calculated with multipliers
8. Round ends, scores displayed
9. Player selects MVP card for next round (if applicable)

---

## 📊 Database Schema (ccm_* tables)

### **Core Tables**

#### `ccm_perpetual_rooms`
Always-on game rooms with continuous cycles.

```sql
- id, room_code, room_name
- status (active/intermission)
- current_game_id, current_game_number
- next_game_starts_at
- max_players_per_game (default: 4)
- ai_fill_enabled (default: true)
- total_games_played, total_unique_players
```

#### `ccm_game_sessions`
Individual 5-round games within perpetual rooms.

```sql
- id, perpetual_room_id, game_number
- status (active/completed)
- current_round (1-5)
- started_at, completed_at
- winner_participant_id, winning_score
```

#### `ccm_session_participants`
Players (human + AI) in each game.

```sql
- id, game_session_id, perpetual_room_id
- participant_type (human/ai_agent)
- student_id (NULL for AI)
- role_hand (10 role card IDs)
- synergy_hand (5 synergy card IDs)
- c_suite_choice (ceo/cfo/cmo/cto/chro)
- total_score, xp_earned
- final_rank, is_winner
```

### **Content Tables** (Shared with CC or separate?)

#### Option A: Share Existing CC Content
- Use existing `cc_role_cards`, `cc_challenges`, etc.
- Both CC and CCM use same card pool
- ✅ No duplication
- ⚠️ Changes affect both modes

#### Option B: Separate CCM Content
- Create `ccm_role_cards`, `ccm_synergy_cards`, `ccm_challenge_cards`
- Independent content for each mode
- ✅ Full control per mode
- ⚠️ More maintenance

**Decision:** TBD (discuss with team)

### **Gameplay Tables**

#### `ccm_round_plays`
Card selections and scoring per round.

```sql
- id, game_session_id, participant_id, round_number
- challenge_card_id
- slot_1_role_card_id
- slot_2_synergy_card_id
- slot_3_card_type (golden/mvp)
- base_score, synergy_multiplier, c_suite_multiplier
- soft_skills_multiplier (🔒 TRADE SECRET)
- final_score
```

#### `ccm_mvp_selections`
MVP card carry-overs between rounds.

```sql
- id, game_session_id, participant_id
- selected_after_round (1-4)
- mvp_card_id
- used_in_round (2-5)
```

#### `ccm_achievements` & `ccm_player_achievements`
Achievement system for CCM.

---

## 🔄 Game Flow

### **Room Lifecycle**
```
1. Room created (status: standby, dormant)
2. First player joins → Room activates
3. AI fills empty seats (minimum 2 total players)
4. Start Game #1
5. Run 5 rounds
6. Game ends
7. 15-second intermission (status: intermission)
8. Players can join/leave during intermission
9. Start Game #2
10. Repeat while at least 1 human player present
11. Last human leaves → Room returns to dormant state
```

### **Player Lifecycle**
```
1. Player enters CCM hub
2. Browse featured perpetual rooms
3. Click "Join Room"
4. If game in progress: Wait for intermission
5. If intermission: Join immediately for next game
6. Play game (5 rounds)
7. Game ends, see results
8. Choose: Play Again (auto-join next game) OR Leave
```

---

## 🎨 UI Components

### **Hub Screen**
- `CCMHub.tsx` - Featured perpetual rooms browser
- Shows room status (Game #X in progress, Next game starts in Xs)
- Join buttons (disabled during active game, enabled during intermission)

### **Room Lobby (Intermission)**
- `CCMIntermission.tsx` - 15-second countdown
- Shows previous game results
- Players ready up for next game
- AI players fill empty seats

### **Game Room**
- `CCMGameRoom.tsx` - Main gameplay orchestrator
- Round timer (60s)
- Card selection UI
- Live scoring and leaderboard
- Real-time opponent visibility

### **Victory Screen**
- `CCMVictoryScreen.tsx` - End game celebration
- Rankings, scores, XP awarded
- "Play Again" button (joins next game in room)
- "Leave Room" button

---

## 🔐 Security & Trade Secrets

### **Soft Skills Matrix Protection**
- Table: `ccm_soft_skills_matrix` (if separate) OR use `cc_soft_skills_matrix`
- **Row Level Security (RLS)** enabled
- Frontend blocked from direct access
- Backend service role calculates multipliers server-side
- Never expose `soft_skills_multiplier` in API responses

### **AI Player Behavior**
- AI difficulty levels: Beginner, Steady, Skilled, Expert
- AI decision-making happens server-side only
- No client-side AI logic exposed

---

## 🚀 API Endpoints

### **Room Management**
- `GET /api/ccm/rooms` - List featured perpetual rooms
- `GET /api/ccm/rooms/:roomId/status` - Get current room status
- `POST /api/ccm/rooms/:roomId/join` - Join room (queue for next game)
- `POST /api/ccm/rooms/:roomId/leave` - Leave room

### **Gameplay**
- `POST /api/ccm/game/:sessionId/c-suite-select` - Submit C-Suite choice (Round 1)
- `POST /api/ccm/game/:sessionId/card-select` - Submit card selection
- `POST /api/ccm/game/:sessionId/lock-in` - Lock in selection
- `POST /api/ccm/game/:sessionId/mvp-select` - Select MVP for next round
- `GET /api/ccm/game/:sessionId/leaderboard` - Get current standings

### **Real-Time (Supabase Channels)**
- `ccm:room:{roomId}` - Room status updates
- `ccm:game:{sessionId}` - Game events (round start, card plays, scoring)

---

## 📈 Analytics & Tracking

### **Room Metrics**
- Total games played
- Peak concurrent players
- Average game duration
- Player retention rate (% who play multiple games)

### **Player Metrics**
- Games played in CCM
- Win rate in perpetual rooms
- Favorite room
- XP earned from CCM

---

## 🧪 Testing Strategy

### **Phase 1: Database & Services**
1. Create all `ccm_*` tables
2. Build `CCMPerpetualRoomManager` service
3. Build `CCMGameOrchestrator` service
4. Test room lifecycle (create → game → intermission → next game)

### **Phase 2: API Integration**
1. Create API endpoints
2. Test join/leave flow
3. Test gameplay flow
4. Test real-time synchronization

### **Phase 3: UI Development**
1. Build CCM hub
2. Build intermission screen
3. Build game room
4. Build victory screen

### **Phase 4: End-to-End Testing**
1. Test with real players
2. Test AI player fill
3. Test edge cases (all humans leave, network issues)
4. Performance testing (multiple concurrent rooms)

---

## 🎯 Success Criteria

- [ ] Perpetual rooms run 24/7 without crashes
- [ ] Players can drop in/out seamlessly
- [ ] AI fills empty seats correctly
- [ ] Games cycle properly (game → intermission → next game)
- [ ] Scoring is accurate and hidden multipliers work
- [ ] Real-time sync works for all players
- [ ] Both CC and CCM can coexist without conflicts

---

## 📝 Next Steps

1. ✅ Documentation complete
2. ⏳ Create database schema (`ccm_*` tables)
3. ⏳ Build backend services
4. ⏳ Create API endpoints
5. ⏳ Build UI components
6. ⏳ Add to Discovered Live menu
7. ⏳ Test and deploy

---

## 🔗 Related Documents

- [CC Single-Player Integration Summary](./career-challenge-integration-summary.md)
- CCM Database Schema (TBD)
- CCM API Design (TBD)
- CCM Service Architecture (TBD)
