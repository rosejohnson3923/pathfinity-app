# Discovered Live! - Full App Integration Guide

## Overview

**Discovered Live!** is a gamification series that provides multiplayer learning experiences after students complete their Learning Journey. The first game is **Career Bingo**, a real-time multiplayer game where students compete to complete rows, columns, or diagonals on a bingo card filled with careers.

---

## User Journey Flow

### Complete Flow:
1. **Login** → Student authenticates
2. **Dashboard** → Select career and AI companion for the day
3. **Learning Journey** → Complete Learn → Experience → Discover containers
4. **Return to Dashboard** → Option to play "Discovered Live!"
5. **Discovered Live!** → Enter multiplayer Career Bingo game
6. **Game Results** → View scores, XP earned, return to dashboard

---

## Architecture Overview

### Key Components:

```
src/
├── pages/
│   └── DiscoveredLivePage.tsx           // Main game page (NEW)
├── components/
│   └── discovered-live/
│       ├── GameLobby.tsx                 // Pre-game lobby (NEW)
│       ├── MultiplayerCard.tsx           // Main game UI (EXISTS)
│       ├── MultiplayerResults.tsx        // Results screen (EXISTS)
│       ├── SpectatorView.tsx             // Watch games (EXISTS)
│       └── PlayerStatusBar.tsx           // Player info (EXISTS)
├── services/
│   ├── GameOrchestrator.ts              // Core game logic (EXISTS)
│   ├── PerpetualRoomScheduler.ts        // Auto-creates rooms (EXISTS)
│   ├── DiscoveredLiveRealtimeService.ts // WebSocket events (EXISTS)
│   └── DiscoveredLiveService.ts         // API calls (EXISTS)
└── types/
    └── DiscoveredLiveTypes.ts           // Type definitions (EXISTS)
```

---

## Database Schema

### Required Tables (Already Created):

```sql
-- Game sessions
discovered_live_sessions
├── id (uuid)
├── room_id (text)
├── game_type (text) - 'career_bingo'
├── status (text) - 'waiting', 'active', 'completed'
├── max_players (int)
├── current_question_number (int)
├── starts_at (timestamptz)
├── ends_at (timestamptz)
└── created_at (timestamptz)

-- Participants in each game
discovered_live_participants
├── id (uuid)
├── session_id (uuid) FK
├── student_id (uuid) FK
├── student_name (text)
├── user_career_code (text) - User's selected career
├── is_ai (boolean)
├── ai_difficulty (text)
├── total_xp (int)
├── correct_answers (int)
├── bingos_completed (int)
└── joined_at (timestamptz)

-- Real-time game events
discovered_live_events
├── id (uuid)
├── session_id (uuid) FK
├── participant_id (uuid) FK
├── event_type (text) - 'answer_submitted', 'bingo_achieved', etc.
├── event_data (jsonb)
└── created_at (timestamptz)

-- Career clues/questions
dl_career_clues
├── id (uuid)
├── career_code (text)
├── clue_text (text)
├── skill_category (text)
├── difficulty_level (text)
└── created_at (timestamptz)
```

### Migrations to Run:

```bash
# All migrations are in database/migrations/
psql -d your_database -f database/migrations/039_discovered_live_game_tables.sql
psql -d your_database -f database/migrations/039b_career_clues_seed.sql
psql -d your_database -f database/migrations/039c_additional_career_clues.sql
psql -d your_database -f database/migrations/039d_missing_athlete_pilot_clues.sql
psql -d your_database -f database/migrations/039e_crossing_guard_janitor_clues.sql
```

---

## Step 1: Add Navigation to Dashboard

### Update Dashboard Component

**File:** `src/components/StudentDashboard.tsx` (or wherever dashboard lives)

```tsx
import { Link } from 'react-router-dom';

function StudentDashboard() {
  const { user, selectedCareer, aiCompanion } = useAuth(); // Your auth context
  const hasCompletedJourney = checkIfJourneyComplete(); // Your logic

  return (
    <div className="dashboard">
      {/* Existing dashboard content */}

      {/* Add Discovered Live! Card */}
      {hasCompletedJourney && (
        <div className="discovered-live-card">
          <h3>🎮 Ready to Play?</h3>
          <p>Compete with other students in Career Bingo!</p>
          <Link
            to="/discovered-live"
            className="btn-primary"
          >
            Play Discovered Live!
          </Link>
        </div>
      )}
    </div>
  );
}
```

---

## Step 2: Create Main Game Page

**File:** `src/pages/DiscoveredLivePage.tsx` (NEW)

```tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import GameLobby from '@/components/discovered-live/GameLobby';
import MultiplayerCard from '@/components/discovered-live/MultiplayerCard';
import MultiplayerResults from '@/components/discovered-live/MultiplayerResults';
import SpectatorView from '@/components/discovered-live/SpectatorView';
import { DiscoveredLiveService } from '@/services/DiscoveredLiveService';
import { perpetualRoomScheduler } from '@/services/PerpetualRoomScheduler';
import type { RoomState } from '@/types/DiscoveredLiveTypes';

type GamePhase = 'lobby' | 'playing' | 'spectating' | 'results';

export default function DiscoveredLivePage() {
  const { user, selectedCareer } = useAuth();
  const navigate = useNavigate();
  const [gamePhase, setGamePhase] = useState<GamePhase>('lobby');
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Redirect if no career selected
    if (!selectedCareer) {
      navigate('/dashboard');
      return;
    }

    // Start the perpetual room scheduler (creates rooms automatically)
    perpetualRoomScheduler.start();

    return () => {
      // Cleanup on unmount
      perpetualRoomScheduler.stop();
    };
  }, [selectedCareer, navigate]);

  const handleJoinGame = async () => {
    if (!user || !selectedCareer) return;

    setIsLoading(true);
    try {
      // Find or create an available room
      const room = await DiscoveredLiveService.findAvailableRoom('career_bingo');

      if (!room) {
        throw new Error('No rooms available');
      }

      // Join the room
      await DiscoveredLiveService.joinRoom(
        room.id,
        user.id,
        user.profile?.full_name || 'Student',
        selectedCareer.code
      );

      setRoomState(room);
      setGamePhase('playing');
    } catch (error) {
      console.error('Error joining game:', error);
      alert('Failed to join game. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpectate = async () => {
    setIsLoading(true);
    try {
      // Find an active game to spectate
      const activeRooms = await DiscoveredLiveService.getActiveRooms('career_bingo');

      if (activeRooms.length === 0) {
        alert('No active games to spectate right now.');
        return;
      }

      setRoomState(activeRooms[0]);
      setGamePhase('spectating');
    } catch (error) {
      console.error('Error spectating game:', error);
      alert('Failed to join as spectator.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGameComplete = (finalResults: any) => {
    setGamePhase('results');
  };

  const handleReturnToDashboard = () => {
    navigate('/dashboard');
  };

  const handlePlayAgain = () => {
    setGamePhase('lobby');
    setRoomState(null);
  };

  return (
    <div className="discovered-live-page min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-2">
            🎮 Discovered Live!
          </h1>
          <p className="text-lg text-gray-600">
            Career Bingo - Compete in Real-Time!
          </p>
        </header>

        {gamePhase === 'lobby' && (
          <GameLobby
            userCareer={selectedCareer}
            onJoinGame={handleJoinGame}
            onSpectate={handleSpectate}
            isLoading={isLoading}
          />
        )}

        {gamePhase === 'playing' && roomState && (
          <MultiplayerCard
            roomState={roomState}
            studentId={user!.id}
            studentName={user!.profile?.full_name || 'Student'}
            userCareerCode={selectedCareer!.code}
            onGameComplete={handleGameComplete}
          />
        )}

        {gamePhase === 'spectating' && roomState && (
          <SpectatorView
            roomState={roomState}
            studentId={user!.id}
            onLeaveRoom={() => setGamePhase('lobby')}
            onToggleJoinNext={(willJoin) => {
              if (willJoin) {
                handleJoinGame();
              }
            }}
          />
        )}

        {gamePhase === 'results' && (
          <MultiplayerResults
            sessionId={roomState!.sessionId}
            onPlayAgain={handlePlayAgain}
            onReturnToDashboard={handleReturnToDashboard}
          />
        )}
      </div>
    </div>
  );
}
```

---

## Step 3: Create Game Lobby Component

**File:** `src/components/discovered-live/GameLobby.tsx` (NEW)

```tsx
import React, { useState, useEffect } from 'react';
import { DiscoveredLiveService } from '@/services/DiscoveredLiveService';

interface GameLobbyProps {
  userCareer: { code: string; name: string; icon: string };
  onJoinGame: () => void;
  onSpectate: () => void;
  isLoading: boolean;
}

export default function GameLobby({
  userCareer,
  onJoinGame,
  onSpectate,
  isLoading,
}: GameLobbyProps) {
  const [activeGames, setActiveGames] = useState(0);
  const [activePlayers, setActivePlayers] = useState(0);

  useEffect(() => {
    // Fetch stats
    const fetchStats = async () => {
      try {
        const rooms = await DiscoveredLiveService.getActiveRooms('career_bingo');
        setActiveGames(rooms.length);

        // Count total players
        let totalPlayers = 0;
        for (const room of rooms) {
          const participants = await DiscoveredLiveService.getRoomParticipants(room.sessionId);
          totalPlayers += participants.length;
        }
        setActivePlayers(totalPlayers);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Update every 10s

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{userCareer.icon}</div>
          <h2 className="text-3xl font-bold mb-2">Ready to Play Career Bingo?</h2>
          <p className="text-gray-600">
            Your chosen career: <span className="font-bold text-purple-600">{userCareer.name}</span>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            (Your bingo card will have {userCareer.name} in the center as a free space!)
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 text-center">
            <div className="text-4xl font-black text-purple-600">{activeGames}</div>
            <div className="text-sm text-gray-600 font-semibold">Active Games</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 text-center">
            <div className="text-4xl font-black text-blue-600">{activePlayers}</div>
            <div className="text-sm text-gray-600 font-semibold">Players Online</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={onJoinGame}
            disabled={isLoading}
            className="w-full px-8 py-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-black text-2xl hover:scale-105 transition-transform shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '⏳ Joining...' : '🚀 JOIN GAME NOW'}
          </button>

          <button
            onClick={onSpectate}
            disabled={isLoading || activeGames === 0}
            className="w-full px-6 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            👀 Watch a Game First
          </button>
        </div>
      </div>

      {/* How to Play */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h3 className="text-2xl font-bold mb-4">How to Play</h3>
        <div className="space-y-3 text-gray-700">
          <div className="flex items-start gap-3">
            <span className="text-2xl">1️⃣</span>
            <p><strong>Read the clue</strong> - Each question describes a career</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">2️⃣</span>
            <p><strong>Find & click</strong> - Click the matching career on your bingo card</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">3️⃣</span>
            <p><strong>Complete lines</strong> - Get 5 in a row (horizontal, vertical, or diagonal)</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">4️⃣</span>
            <p><strong>Earn XP</strong> - +10 XP per correct answer, +50 XP per bingo!</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">5️⃣</span>
            <p><strong>Compete</strong> - Race against other students for the top spot</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Step 4: Update Routing

**File:** `src/App.tsx` (or your main routing file)

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DiscoveredLivePage from '@/pages/DiscoveredLivePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Existing routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<StudentDashboard />} />

        {/* New Discovered Live! route */}
        <Route
          path="/discovered-live"
          element={
            <ProtectedRoute>
              <DiscoveredLivePage />
            </ProtectedRoute>
          }
        />

        {/* Other routes */}
      </Routes>
    </BrowserRouter>
  );
}
```

---

## Step 5: Initialize Perpetual Room Scheduler

The scheduler automatically creates game rooms so there's always one available.

**File:** `src/main.tsx` or `src/App.tsx` (application entry point)

```tsx
import { perpetualRoomScheduler } from '@/services/PerpetualRoomScheduler';

// Start the scheduler when app initializes
useEffect(() => {
  // Only start on client-side
  if (typeof window !== 'undefined') {
    perpetualRoomScheduler.start();
  }

  return () => {
    perpetualRoomScheduler.stop();
  };
}, []);
```

---

## Step 6: Update MultiplayerCard to Use User Career

**File:** `src/components/discovered-live/MultiplayerCard.tsx` (UPDATE)

The component already exists, but ensure it receives and uses `userCareerCode`:

```tsx
interface MultiplayerCardProps {
  roomState: RoomState;
  studentId: string;
  studentName: string;
  userCareerCode: string; // ← Make sure this is passed
  onGameComplete: (results: any) => void;
}

export default function MultiplayerCard({
  roomState,
  studentId,
  studentName,
  userCareerCode, // ← User's selected career
  onGameComplete,
}: MultiplayerCardProps) {
  // Generate bingo card with user's career in center
  const bingoGrid = useMemo(() => {
    return generateBingoCard(userCareerCode); // ← Pass user career
  }, [userCareerCode]);

  // Center square is pre-unlocked
  const [unlockedSquares, setUnlockedSquares] = useState<number[]>([12]);

  // Rest of component logic...
}
```

**Update the `generateBingoCard` function:**

```tsx
function generateBingoCard(userCareerCode: string): string[] {
  const allCareers = [
    'Chef', 'Teacher', 'Doctor', 'Nurse', 'Firefighter',
    'Programmer', 'Artist', 'Musician', 'Scientist', 'Engineer',
    'Veterinarian', 'Dentist', 'Lawyer', 'Pilot', 'Architect',
    'Photographer', 'Writer', 'Mechanic', 'Electrician', 'Plumber',
    'Farmer', 'Librarian', 'Accountant', 'Police Officer', 'Athlete'
  ];

  // Get user's career name from code
  const userCareerName = getCareerNameFromCode(userCareerCode);

  const grid: string[] = [];
  const used = new Set<string>();

  // Reserve user's career for center
  used.add(userCareerName);

  for (let i = 0; i < 25; i++) {
    // Center square (position 12) is user's career
    if (i === 12) {
      grid.push(userCareerName);
      continue;
    }

    let career: string;
    let attempts = 0;
    do {
      career = allCareers[Math.floor(Math.random() * allCareers.length)];
      attempts++;
      if (attempts > 100) {
        throw new Error('Cannot generate unique bingo grid');
      }
    } while (used.has(career));

    used.add(career);
    grid.push(career);
  }

  return grid;
}
```

---

## Step 7: Add Visual Indicator for User's Career

**File:** `src/components/discovered-live/MultiplayerCard.tsx` (UPDATE)

Update the rendering to show "MY CAREER" label on center square:

```tsx
{bingoGrid.map((career, index) => {
  const row = Math.floor(index / 5);
  const col = index % 5;
  const isCenter = row === 2 && col === 2;
  const isUnlocked = unlockedSquares.includes(index);

  return (
    <div
      key={index}
      className={`
        bingo-square
        ${isCenter ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : ''}
        ${isUnlocked ? 'bg-gradient-to-br from-green-400 to-green-600' : 'bg-gray-100'}
        ${!isCenter && !isUnlocked ? 'cursor-pointer hover:bg-purple-100' : ''}
      `}
      onClick={() => !isCenter && !isUnlocked && handleSquareClick(index, career)}
    >
      <div className="text-2xl mb-1">{getCareerIcon(career)}</div>
      <div className="text-sm font-semibold">{career}</div>
      {isCenter && (
        <div className="text-xs mt-1 font-bold">⭐ MY CAREER</div>
      )}
    </div>
  );
})}
```

---

## Step 8: Environment Variables

**File:** `.env` (or `.env.local`)

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Discovered Live! Configuration
VITE_DISCOVERED_LIVE_ENABLED=true
VITE_DL_ROOM_SIZE=10
VITE_DL_GAME_DURATION_SECONDS=120
VITE_DL_QUESTION_TIMER_SECONDS=8
```

---

## Step 9: Enable Supabase Realtime

Make sure Realtime is enabled for these tables in Supabase dashboard:

1. Go to **Database → Replication**
2. Enable Realtime for:
   - `discovered_live_sessions`
   - `discovered_live_participants`
   - `discovered_live_events`

---

## Step 10: Testing Checklist

### Pre-Launch Testing:

- [ ] User can see "Discovered Live!" option after completing journey
- [ ] Clicking opens game lobby
- [ ] User's selected career appears in center of bingo card
- [ ] Can join a game successfully
- [ ] Timer counts down (8 seconds per question)
- [ ] Clicking correct career unlocks square (+10 XP)
- [ ] Completing row/column/diagonal shows "BINGO!" (+50 XP)
- [ ] AI players answer throughout the game
- [ ] Leaderboard updates in real-time
- [ ] Game completes after all questions
- [ ] Results screen shows correct rankings
- [ ] Can play again or return to dashboard
- [ ] Spectator mode works (if implemented)
- [ ] Multiple users can play simultaneously
- [ ] No data loss on disconnect/reconnect

---

## Future Games in Discovered Live! Series

The architecture supports multiple game types:

### Planned Games:

1. **Career Bingo** (CURRENT) - Match careers to clues
2. **Skills Sprint** - Speed-based skill matching
3. **Path Predictor** - Predict career paths from interests
4. **Industry Explorer** - Explore different industries
5. **Future Forecast** - Predict job market trends

### Adding New Games:

1. Update `game_type` enum in database
2. Create new game component (e.g., `SkillsSprintCard.tsx`)
3. Add game logic to `GameOrchestrator.ts`
4. Create new clue/question tables if needed
5. Update `DiscoveredLivePage.tsx` to route to new game

---

## Performance Optimization

### Bundle Size:
- Lazy load Discovered Live! page:
  ```tsx
  const DiscoveredLivePage = lazy(() => import('@/pages/DiscoveredLivePage'));
  ```

### Caching:
- Cache career clues in localStorage
- Implement service worker for offline support

### Real-time Optimization:
- Use presence channels for player count
- Batch event updates (every 500ms instead of real-time)
- Implement connection pooling

---

## Monitoring & Analytics

### Track These Metrics:

```typescript
// Example tracking
analytics.track('discovered_live_game_started', {
  game_type: 'career_bingo',
  user_career: userCareerCode,
  room_id: roomState.id,
});

analytics.track('discovered_live_game_completed', {
  game_type: 'career_bingo',
  final_score: totalXP,
  bingos_completed: bingosCount,
  rank: finalRank,
  duration_seconds: gameDuration,
});
```

### Key Metrics:
- Games per day
- Average players per game
- Completion rate
- Average XP earned
- User retention (come back to play again?)

---

## Troubleshooting

### Issue: Rooms not appearing
**Solution:** Check that `PerpetualRoomScheduler` is running:
```tsx
console.log('Scheduler status:', perpetualRoomScheduler.getStatus());
```

### Issue: Realtime not working
**Solution:** Verify Supabase Realtime is enabled and channel subscriptions are active

### Issue: User career not showing in center
**Solution:** Ensure `userCareerCode` is passed correctly from dashboard to game page

### Issue: Diagonal bingos not detected
**Solution:** Check that `checkBingos()` includes diagonal detection logic

---

## Security Considerations

### Row-Level Security (RLS):

Ensure these policies are enabled:

```sql
-- Users can only see sessions they're participating in
CREATE POLICY "Users can view their sessions"
ON discovered_live_participants
FOR SELECT
USING (auth.uid() = student_id);

-- Prevent score manipulation
CREATE POLICY "Only server can update scores"
ON discovered_live_participants
FOR UPDATE
USING (auth.role() = 'service_role');
```

---

## Deployment Checklist

- [ ] Run all database migrations
- [ ] Seed career clues data
- [ ] Enable Supabase Realtime
- [ ] Configure environment variables
- [ ] Test with multiple concurrent users
- [ ] Monitor server resource usage
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure analytics
- [ ] Update documentation
- [ ] Train support team

---

## Support & Maintenance

### Weekly Tasks:
- Review game logs for errors
- Check player feedback
- Monitor server performance
- Review XP balance (too easy/hard?)

### Monthly Tasks:
- Add new career clues
- Analyze game metrics
- Plan new game types
- Update difficulty algorithms

---

## Documentation References

- **Complete Features:** `docs/Discovered_Live_Final_Completion_Summary.md`
- **Performance Guide:** `docs/Performance_Optimization_Guide.md`
- **Bug Fixes:** `docs/Test_Page_Bug_Fixes.md`
- **Database Migrations:** `database/migrations/039_*.sql`
- **Test Instructions:** `TEST_INSTRUCTIONS.md`

---

## 🎉 You're Ready to Launch!

Once all steps are complete, Discovered Live! will be fully integrated into your app, providing an engaging multiplayer experience that reinforces career learning!

**Next Steps:**
1. Follow this guide step-by-step
2. Test thoroughly in staging environment
3. Soft launch to limited users
4. Monitor and iterate based on feedback
5. Full launch! 🚀
