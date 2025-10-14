# Discovered Live! - Multiplayer Design V2 (Click-to-Answer)

**Date:** 2025-10-12
**Status:** 🔵 Design Phase - REVISED
**Goal:** Visual pattern recognition speed game with limited bingo slots

---

## 🎯 Core Game Concept

**"Bingo meets visual pattern recognition speed game"**

- Each player gets a **unique 5×5 card** with careers scrambled differently
- All careers are **visible from the start** (icons + names)
- Question appears in **center square** (2,2)
- Players **click** the correct career on their card
- Limited **bingo slots** (e.g., 3 bingos for 6 players)
- First players to complete lines win bingos
- Same player can win multiple bingos with a good card

---

## 🎮 Updated Game Flow

### 1. Room Setup & Card Generation

```
PLAYER JOINS ROOM
├─ Generate unique 5×5 grid for this player
│  ├─ Center (2,2) = "QUESTION" placeholder
│  ├─ Other 24 squares = random careers (shuffled uniquely)
│  └─ All careers visible (icon + name shown)
│
├─ Calculate bingo slots based on player count
│  └─ Formula: Math.ceil(playerCount / 2), min 2, max 6
│
└─ Store grid in dl_room_participants.bingo_grid
```

**Example: 4 Players, 4 Different Cards**

```
Player 1:                Player 2:                Player 3:                Player 4:
👨‍🍳 👮 📸 👨‍⚕️ 🎨        🎵 👨‍🌾 🔬 ⚖️ 👨‍💼       📚 🚒 👨‍🏫 🎬 ✈️        🦷 🏥 🌳 🚌 📬
👨‍🏫 🚒 📚 🎵 👨‍🌾        👨‍🍳 👮 📸 👨‍⚕️ 🎨       🐕 📝 🏃 🔬 ⚖️        💃 🛑 🧹 👨‍🍳 👮
🔬 ⚖️ 💡 👨‍💼 🏃        📚 🚒 💡 🎵 👨‍🌾       👨‍💼 🏃 💡 👨‍🍳 👮       📸 👨‍⚕️ 💡 🎨 👨‍🏫
👨‍🔧 ✈️ 🎬 👨‍🍳 🐕       🏃 👨‍🔧 ✈️ 🎬 👨‍🍳      📸 👨‍⚕️ 🎨 👨‍🏫 🚒       🚒 📚 🎵 👨‍🌾 🔬
🦷 🏥 🌳 🚌 📬        🐕 🦷 🏥 🌳 🚌        🚌 📬 💃 🛑 🧹        ⚖️ 👨‍💼 🏃 👨‍🔧 ✈️

Center = Question    Center = Question    Center = Question    Center = Question
```

---

### 2. Question Cycle

```
QUESTION STARTS (t=0s)
├─ Question text appears in center square of ALL cards
│  └─ "This career keeps schools clean and safe"
│
├─ Timer starts (based on grade level)
│  ├─ Elementary: 15 seconds
│  ├─ Middle: 10 seconds
│  └─ High: 5 seconds
│
├─ Correct answer: "janitor"
│
└─ All players scan their card to find janitor

PLAYERS CLICK (t=0-15s)
├─ Player 1 clicks "🧹 Janitor" at position (4,2) at t=3.2s
│  ├─ Check: Is this janitor? ✓ YES
│  ├─ Square lights up with green glow + confetti ✨
│  ├─ Player 1 unlocks position (4,2)
│  └─ Broadcast: Player 1 answered correctly in 3.2s
│
├─ Player 2 clicks "🏥 Nurse" at position (4,2) at t=4.8s
│  ├─ Check: Is this janitor? ✗ NO
│  ├─ Square shakes with red flash ❌
│  └─ No unlock, no broadcast
│
├─ Player 3 clicks "🧹 Janitor" at position (4,4) at t=5.1s
│  ├─ Check: Is this janitor? ✓ YES
│  ├─ Square lights up ✨
│  └─ Player 3 unlocks position (4,4)
│
└─ Player 4 (AI) clicks "🧹 Janitor" at position (1,2) at t=6.5s
   └─ Square lights up ✨

CHECK FOR BINGOS
├─ Player 1: Row 4 complete? → Check [0,1,2,3,4]
│  └─ Not yet, needs more unlocks
│
├─ Player 3: Row 4 complete? → YES! 🎉
│  ├─ BINGO ACHIEVED!
│  ├─ Player 3 scores Bingo #1
│  ├─ Bingo counter: 3/3 → 2/3 remaining
│  └─ Broadcast celebration to all players
│
└─ Wait 2 seconds for celebration, then next question
```

---

### 3. Game End Conditions

```
GAME ENDS WHEN:
├─ All bingo slots claimed (e.g., 3/3 bingos won)
└─ OR 20 questions completed (fallback)

RANKING:
1st Place: Most bingos won
2nd Place: Second most bingos
Tiebreaker: Total XP earned (correct answers)

REWARDS:
├─ 1st Bingo: +50 XP
├─ 2nd Bingo: +40 XP
├─ 3rd Bingo: +30 XP
├─ Per correct answer: +10 XP
└─ Speed bonus: +5 XP if answered in < 5 seconds
```

---

## 🔢 Bingo Slot System

### Formula

```typescript
function calculateBingoSlots(playerCount: number): number {
  // Base: Half the players can win, rounded up
  const slots = Math.ceil(playerCount / 2);

  // Min 2 bingos (keeps game competitive)
  // Max 6 bingos (prevents games from running too long)
  return Math.max(2, Math.min(6, slots));
}

// Examples:
// 2 players → 2 bingos (both can win)
// 3 players → 2 bingos (66% win rate)
// 4 players → 2 bingos (50% win rate)
// 6 players → 3 bingos (50% win rate)
// 8 players → 4 bingos (50% win rate)
// 10 players → 5 bingos (50% win rate)
// 12+ players → 6 bingos (capped, 50% win rate)
```

### Bingo Claiming Rules

1. **First Come, First Served**
   - First player to complete a line claims that bingo slot
   - Bingo counter decrements immediately

2. **Multiple Bingos Per Player**
   - A player CAN win multiple bingos in one game
   - Example: Player with great card wins 2 of 3 available slots

3. **Simultaneous Bingos**
   - If 2 players complete lines on same question:
     - Both get bingo credit
     - Both slots decremented
     - Ranked by completion speed

4. **Game Continues Until Slots Filled**
   - Even if one player wins multiple, game continues
   - Until all slots claimed OR 20 questions done

---

## 📊 Updated Database Schema

### Changes to `dl_room_participants`

```sql
ALTER TABLE dl_room_participants
ADD COLUMN bingo_grid JSONB NOT NULL DEFAULT '[]';  -- Each player's unique card

-- Example bingo_grid structure:
{
  "careers": [
    ["chef", "police-officer", "photographer", "doctor", "artist"],
    ["teacher", "firefighter", "librarian", "musician", "farmer"],
    ["scientist", "lawyer", "QUESTION", "business", "athlete"],
    ["engineer", "pilot", "actor", "chef", "veterinarian"],
    ["dentist", "nurse", "park-ranger", "bus-driver", "mail-carrier"]
  ]
}
```

### Changes to `dl_game_rooms`

```sql
ALTER TABLE dl_game_rooms
ADD COLUMN bingo_slots_total INTEGER NOT NULL,      -- Total bingos available (e.g., 3)
ADD COLUMN bingo_slots_remaining INTEGER NOT NULL,  -- How many left to claim
ADD COLUMN bingo_winners JSONB DEFAULT '[]';        -- Array of {participantId, bingoNumber, timestamp}

-- Example bingo_winners:
[
  {
    "participantId": "uuid-player3",
    "bingoNumber": 1,
    "bingoType": "row",
    "bingoIndex": 4,
    "claimedAt": "2025-10-12T14:23:45Z",
    "questionNumber": 8
  },
  {
    "participantId": "uuid-player1",
    "bingoNumber": 2,
    "bingoType": "column",
    "bingoIndex": 2,
    "claimedAt": "2025-10-12T14:25:10Z",
    "questionNumber": 12
  }
]
```

### New: `dl_click_events` (for analytics)

```sql
CREATE TABLE dl_click_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES dl_game_rooms(id),
  participant_id UUID NOT NULL REFERENCES dl_room_participants(id),
  question_number INTEGER NOT NULL,
  clue_id UUID NOT NULL REFERENCES dl_clues(id),

  -- Click details
  clicked_career_code VARCHAR(100) NOT NULL,
  clicked_position JSONB NOT NULL,  -- {row: number, col: number}
  correct_career_code VARCHAR(100) NOT NULL,
  is_correct BOOLEAN NOT NULL,

  -- Timing
  question_started_at TIMESTAMPTZ NOT NULL,
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  response_time_seconds NUMERIC(6,2),

  -- Result
  unlocked_position JSONB,  -- Only if correct
  bingo_achieved BOOLEAN DEFAULT false,
  bingo_number INTEGER,  -- Which bingo slot (1, 2, 3...)

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dl_clicks_room ON dl_click_events(room_id);
CREATE INDEX idx_dl_clicks_participant ON dl_click_events(participant_id);
CREATE INDEX idx_dl_clicks_correct ON dl_click_events(is_correct);
```

---

## 🤖 AI Agent Behavior (Updated)

### AI Click Simulation

```typescript
class AIAgent {
  async findAndClickAnswer(
    clue: CareerClue,
    myGrid: string[][],
    difficulty: string
  ): Promise<{ row: number, col: number, responseTime: number }> {

    // 1. Determine if AI will answer correctly based on difficulty
    const correctCareer = clue.careerCode;
    const shouldAnswerCorrectly = Math.random() < this.config.accuracyRate;

    // 2. Find the career on the grid
    let targetCareer: string;
    let foundPosition: { row: number, col: number } | null = null;

    if (shouldAnswerCorrectly) {
      // Find correct career on MY grid
      targetCareer = correctCareer;
      foundPosition = this.findCareerOnGrid(myGrid, targetCareer);
    } else {
      // Pick a random wrong career
      const wrongCareers = myGrid.flat().filter(c =>
        c !== correctCareer && c !== 'QUESTION'
      );
      targetCareer = wrongCareers[Math.floor(Math.random() * wrongCareers.length)];
      foundPosition = this.findCareerOnGrid(myGrid, targetCareer);
    }

    if (!foundPosition) {
      // Fallback: click random square (simulates panic click)
      foundPosition = {
        row: Math.floor(Math.random() * 5),
        col: Math.floor(Math.random() * 5)
      };
    }

    // 3. Simulate realistic response time
    // Harder difficulties "think" longer but are more accurate
    const baseTime = {
      'easy': 2,     // Quick but inaccurate
      'medium': 4,   // Balanced
      'hard': 6,     // Careful and accurate
      'expert': 3    // Fast AND accurate (challenging)
    }[difficulty];

    const responseTime = baseTime + (Math.random() - 0.5) * 2;

    return {
      row: foundPosition.row,
      col: foundPosition.col,
      responseTime: Math.max(1, responseTime)
    };
  }

  private findCareerOnGrid(grid: string[][], careerCode: string): { row: number, col: number } | null {
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        if (grid[row][col] === careerCode) {
          return { row, col };
        }
      }
    }
    return null;
  }
}
```

---

## ⏱️ Time Limit System

### Grade-Based Timing

```typescript
function getQuestionTimeLimit(gradeCategory: string): number {
  switch (gradeCategory) {
    case 'elementary':
      return 15;  // 15 seconds (plenty of time to scan)
    case 'middle':
      return 10;  // 10 seconds (moderate pressure)
    case 'high':
      return 5;   // 5 seconds (high pressure, fast scanning)
    default:
      return 10;
  }
}
```

### Timer Display

```
⏱️ 12 seconds   (green)
⏱️ 5 seconds    (yellow - warning)
⏱️ 2 seconds    (red - urgent)
⏱️ TIME UP!     (red flash)
```

### Timeout Behavior

```
IF NO ONE CLICKS CORRECT ANSWER:
├─ Timer expires
├─ Question ends with "No one got it!" message
├─ Broadcast: "Correct answer was: Janitor 🧹"
└─ Move to next question (no one gets unlock)

IF SOME CLICKED CORRECT:
├─ Timer expires
├─ Show who got it: "Player 1 and Bot2 got it!"
└─ Move to next question
```

---

## 🎨 UI Components (Updated)

### 1. Multiplayer Card Component

```typescript
interface MultiplayerCardProps {
  myGrid: string[][];
  unlockedPositions: GridPosition[];
  completedLines: BingoLines;
  currentQuestion: string | null;
  timeRemaining: number;
  onSquareClick: (row: number, col: number) => void;
  disabled: boolean;  // During question transition
}

// Square states:
// - Default: Career visible, clickable, gray border
// - Unlocked: Career visible, green glow, not clickable
// - Center: Question text, not clickable
// - Correct click: Animate with confetti burst
// - Wrong click: Shake animation, red flash
// - In bingo line: Gold border highlight
```

### 2. Player Status Sidebar

```typescript
interface PlayerStatusProps {
  participants: Participant[];
  currentParticipantId: string;
  bingoSlotsRemaining: number;
  bingoSlotsTotal: number;
}

// Shows:
// - Player avatar + name
// - Bingos won (🏆 icons)
// - Current XP
// - "Answered ✓" or "Thinking..." status
```

### 3. Question Center Display

```typescript
interface QuestionCenterProps {
  questionText: string;
  questionNumber: number;
  totalQuestions: number;
  timeRemaining: number;
  timeLimit: number;
}

// Displays in center square (2,2)
// Pulses with timer urgency
// Shows countdown with color coding
```

---

## 🎯 Strategy & Game Balance

### Card Positioning Strategy

**Good Cards:**
- Correct answers clustered in corners (easy to form lines)
- Common careers in center area
- Diverse career distribution

**Bad Cards:**
- Correct answers scattered randomly
- Rare careers grouped together
- Unlucky positioning (hard to form lines)

**Over Many Games:**
- Card luck averages out
- Faster players win more often
- Pattern recognition skill matters

### Bingo Slot Balance

| Players | Bingo Slots | Win Rate | Game Length |
|---------|-------------|----------|-------------|
| 2 | 2 | 100% | ~8-12 questions |
| 4 | 2 | 50% | ~10-15 questions |
| 6 | 3 | 50% | ~12-18 questions |
| 8 | 4 | 50% | ~15-20 questions |

**Design Intent:**
- ~50% win rate keeps it competitive
- Games end before 20 questions usually
- Prevents runaway victories
- Multiple winners possible

---

## 🧪 Testing Plan: You vs 3 AI Bots

### Test Scenario 1: Balanced Competition

**Setup:**
- You (human player)
- QuickBot (easy, fast but inaccurate)
- SteadyBot (medium, balanced)
- ThinkBot (hard, slow but accurate)
- Grade: Elementary (15s per question)
- Bingo slots: 2 available

**Expected Outcome:**
- QuickBot clicks first but makes mistakes
- You compete with SteadyBot for speed
- ThinkBot gets most correct but slower
- Competition for 2 bingo slots is tight
- Game ends around question 10-15

### Test Scenario 2: Speed Challenge

**Setup:**
- You vs 3 Expert AI bots
- Grade: High school (5s per question)
- Bingo slots: 2 available

**Expected Outcome:**
- High pressure, fast clicking
- Tests your pattern recognition speed
- AI bots are highly accurate and fast
- You need to be both fast AND accurate

### Test Scenario 3: Large Room

**Setup:**
- You + 7 AI bots (8 total)
- Mixed difficulties
- Bingo slots: 4 available
- Grade: Middle school (10s)

**Expected Outcome:**
- More competition for slots
- Some players left out
- Tests scalability
- Validates multi-player logic

---

## 🚀 Implementation Order

### Phase 1: Core Click System (Week 1)
- [ ] Update database schema (bingo_grid per player, bingo_slots)
- [ ] Generate unique cards for each player
- [ ] Build click detection and validation
- [ ] Implement correct/wrong animations
- [ ] Test with static questions

### Phase 2: AI Agents (Week 1-2)
- [ ] Build AIAgentService with click behavior
- [ ] Implement difficulty-based accuracy
- [ ] Add realistic timing simulation
- [ ] Test 1v3 bot scenario

### Phase 3: Bingo Slot System (Week 2)
- [ ] Implement bingo slot calculation
- [ ] Build bingo claiming logic
- [ ] Handle simultaneous bingos
- [ ] Add bingo celebration UI

### Phase 4: Real-time Sync (Week 2-3)
- [ ] WebSocket integration for clicks
- [ ] Live player status updates
- [ ] Timer synchronization
- [ ] Handle disconnections

### Phase 5: Polish & Testing (Week 3)
- [ ] Grade-based time limits
- [ ] Enhanced animations
- [ ] Results screen with rankings
- [ ] Performance optimization
- [ ] End-to-end testing

---

## ✅ Success Metrics

**Must Have:**
- [x] Each player has unique scrambled card
- [x] Center square shows question
- [x] Click correct career → unlocks with celebration
- [x] Click wrong career → shake animation, no unlock
- [x] Limited bingo slots system works
- [x] Same player can win multiple bingos
- [x] AI bots click realistically
- [x] Game ends when slots filled

**Nice to Have:**
- [ ] Spectator mode
- [ ] Replay of winning moves
- [ ] Heat map of most-clicked careers
- [ ] "Close call" notifications (two players clicked same second)

---

## 🎉 Why This Design is Better

1. **Visual Learning** - Students see all careers, builds familiarity
2. **Speed Over Knowledge** - Pattern recognition > memorization
3. **Fair Competition** - No lucky shared grid advantage
4. **Scalable** - Works with 2-12+ players
5. **Strategic Depth** - Card position matters, multiple wins possible
6. **Engaging** - Fast-paced, exciting, less "quiz-like"
7. **Testable** - AI bots provide consistent competition
8. **Replayable** - Different cards every game keeps it fresh

---

## 📝 Open Questions for You

1. **Question Display Duration:**
   - Should question stay visible in center during answers?
   - Or hide after 5 seconds to test memory?

2. **Wrong Click Penalty:**
   - Just visual feedback (shake)?
   - Or lose points / time penalty?

3. **Partial Credit:**
   - If you click wrong first, can you click again?
   - Or locked to one attempt per question?

4. **Spectator Features:**
   - Should spectators see all player cards?
   - Or just leaderboard and their own card?

5. **Sound Effects:**
   - Tick-tock for timer?
   - Celebration sounds for correct clicks?
   - Different sounds for bingos?

---

**Ready to start implementing! Where should I begin?**
1. Database schema updates?
2. Card generation logic?
3. Click interaction system?
4. AI agent click behavior?
