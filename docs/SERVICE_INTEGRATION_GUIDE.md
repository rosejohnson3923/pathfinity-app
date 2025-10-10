# Service Integration Guide
**Journey Tracking → PathIQ → Leaderboard → Summary Screen**

This guide explains how to integrate the newly created persistence services into your application.

---

## 📋 What Was Created

### **1. Database Services**

#### `JourneyTrackingService`
`src/services/tracking/JourneyTrackingService.ts`
- Tracks real-time performance in LEARN, EXPERIENCE, DISCOVER containers
- Records question-level data
- Auto-saves every 30 seconds
- Writes to `container_sessions` table

#### `PathIQPersistenceService`
`src/services/persistence/PathIQPersistenceService.ts`
- Manages PathIQ profiles (XP, levels, achievements)
- Award/spend XP with automatic level-up
- Streak tracking
- Writes to `pathiq_profiles` and `xp_transactions` tables

#### `JourneySummaryService`
`src/services/persistence/JourneySummaryService.ts`
- Creates journey summaries for lesson plans
- Aggregates container progress
- Marks lesson plan generation
- Writes to `journey_summaries` table

#### `RealLeaderboardService`
`src/services/leaderboard/RealLeaderboardService.ts`
- Real-time leaderboard rankings
- Grade-level and tenant filtering
- Anonymous display names for privacy
- Reads from `pathiq_leaderboard_view`

---

### **2. React Hooks**

#### `useJourneySummary`
`src/hooks/useJourneySummary.ts`
- Fetches journey summary data for UI
- Transforms database format to component format
- Provides loading/error states

#### `useLeaderboard`
`src/hooks/useLeaderboard.ts`
- Fetches leaderboard data
- Current user position tracking
- Auto-refresh capability

---

### **3. UI Components**

#### `JourneySummaryContainer`
`src/components/summary/JourneySummaryContainer.tsx`
- Integration wrapper for JourneySummaryScreen
- Handles data fetching and transformation
- Loading, error, and empty states

---

## 🚀 Integration Instructions

### **Step 1: Track Container Sessions**

When a student starts a LEARN, EXPERIENCE, or DISCOVER container:

```typescript
import { journeyTrackingService } from '@/services/tracking/JourneyTrackingService';

// Start tracking when container begins
const startTracking = async () => {
  await journeyTrackingService.startSession({
    sessionId: 'unique-session-id',
    container: 'LEARN',
    subject: 'Math',
    skillId: 'K.Math.A.1',
    skillName: 'Counting to 10',
    gradeLevel: 'K'
  });
};

// Record each question attempt
const recordQuestion = async (attempt) => {
  await journeyTrackingService.recordQuestionAttempt(
    'unique-session-id',
    'LEARN',
    {
      questionId: 'q1',
      questionText: 'What is 2 + 2?',
      studentAnswer: '4',
      correctAnswer: '4',
      isCorrect: true,
      attemptNumber: 1,
      timeSpent: 15,
      hintsUsed: 0
    }
  );
};

// Award XP during session
const awardXP = async () => {
  await journeyTrackingService.awardSessionXP(
    'unique-session-id',
    'LEARN',
    50 // XP amount
  );
};

// Complete session when container ends
const completeSession = async () => {
  const result = await journeyTrackingService.completeSession(
    'unique-session-id',
    'LEARN'
  );
  console.log('Session saved:', result.data);
};
```

---

### **Step 2: Award PathIQ XP**

After tracking session performance, award XP to the student:

```typescript
import { pathiqPersistenceService } from '@/services/persistence/PathIQPersistenceService';

const awardXPToProfile = async () => {
  const result = await pathiqPersistenceService.awardXP({
    amount: 50,
    reason: 'Completed Math LEARN container',
    category: 'learning',
    sessionId: 'unique-session-id',
    container: 'LEARN',
    subject: 'Math',
    skillId: 'K.Math.A.1'
  });

  if (result.success) {
    console.log(`XP awarded! New XP: ${result.newXp}, Level: ${result.newLevel}`);

    if (result.levelUps && result.levelUps > 0) {
      console.log(`🎉 LEVEL UP! Now level ${result.newLevel}!`);
    }
  }
};

// Spend XP for hints
const useHint = async () => {
  const result = await pathiqPersistenceService.spendXP({
    amount: 10,
    reason: 'Purchased hint'
  });

  if (!result.success) {
    alert('Not enough XP for a hint!');
  }
};
```

---

### **Step 3: Create Journey Summary**

When the session starts or first container completes:

```typescript
import { journeySummaryService } from '@/services/persistence/JourneySummaryService';

// Initialize journey summary
const initJourney = async () => {
  await journeySummaryService.upsertJourneySummary({
    sessionId: 'unique-session-id',
    studentName: 'Sam',
    gradeLevel: 'K',
    careerId: 'chef',
    careerName: 'Chef',
    companionId: 'finn',
    companionName: 'Finn'
  });
};

// Update container progress after each container completes
const updateContainerProgress = async () => {
  // Build progress from container sessions
  const progress = await journeySummaryService.buildContainerProgress(
    'unique-session-id',
    'LEARN'
  );

  // Save to journey summary
  await journeySummaryService.updateContainerProgress(
    'unique-session-id',
    'LEARN',
    progress
  );
};
```

---

### **Step 4: Display Journey Summary Screen**

When all containers are complete, show the summary:

```typescript
import JourneySummaryContainer from '@/components/summary/JourneySummaryContainer';

const SummaryView = () => {
  return (
    <JourneySummaryContainer
      sessionId="unique-session-id"
      onReturnToDashboard={() => {
        // Navigate back to dashboard
        router.push('/dashboard');
      }}
      theme="light"
    />
  );
};
```

Or use the hook directly:

```typescript
import { useJourneySummary } from '@/hooks/useJourneySummary';

const CustomSummary = ({ sessionId }) => {
  const { data, loading, error, refetch } = useJourneySummary(sessionId);

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;
  if (!data) return <NoData />;

  return (
    <div>
      <h1>{data.studentName}'s Journey</h1>
      <p>Total XP: {data.totalXPEarned}</p>
      <p>Score: {data.overallScore}%</p>
      {/* Display container progress */}
    </div>
  );
};
```

---

### **Step 5: Display Real Leaderboard**

```typescript
import { useLeaderboard } from '@/hooks/useLeaderboard';

const LeaderboardView = () => {
  const { data, loading, error, currentUserPosition, refresh } = useLeaderboard({
    gradeLevel: 'K',
    limit: 10
  });

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div>
      <h2>🏆 Top Players</h2>

      {/* Current user position */}
      {currentUserPosition && (
        <div className="user-rank">
          <p>Your Rank: #{currentUserPosition.rank}</p>
          <p>Your XP: {currentUserPosition.xp}</p>
          <p>Top {currentUserPosition.percentile}%</p>
        </div>
      )}

      {/* Leaderboard list */}
      {data?.players.map(player => (
        <div key={player.userId} className={player.isCurrentUser ? 'highlight' : ''}>
          <span>#{player.rank}</span>
          <span>{player.displayName}</span>
          <span>{player.xp} XP</span>
          <span>Level {player.level}</span>
          {player.careerIcon && <span>{player.careerIcon}</span>}
        </div>
      ))}

      <button onClick={refresh}>Refresh</button>
    </div>
  );
};
```

---

## 🔄 Complete Integration Flow

Here's the complete flow from student action to leaderboard update:

```
1. Student starts LEARN container
   ↓
2. JourneyTrackingService.startSession()
   ↓
3. Student answers questions
   ↓
4. JourneyTrackingService.recordQuestionAttempt() (for each question)
   ↓
5. Student completes container
   ↓
6. JourneyTrackingService.completeSession()
   → Saves to container_sessions table
   ↓
7. PathIQPersistenceService.awardXP()
   → Updates pathiq_profiles table
   → Creates xp_transactions record
   → Triggers level-up if needed
   ↓
8. JourneySummaryService.updateContainerProgress()
   → Updates journey_summaries table
   ↓
9. Student completes all 3 containers
   ↓
10. Show JourneySummaryContainer
    → Displays comprehensive summary
    → Option to generate lesson plan
    ↓
11. Leaderboard auto-updates
    → Shows new rankings
    → User sees new position
```

---

## 🎯 Key Integration Points

### **In Container Components**

Update your LEARN/EXPERIENCE/DISCOVER containers to call tracking service:

```typescript
// AILearnContainerV2-UNIFIED.tsx
import { journeyTrackingService } from '@/services/tracking/JourneyTrackingService';

const AILearnContainer = () => {
  // On mount - start tracking
  useEffect(() => {
    journeyTrackingService.startSession({
      sessionId: currentSessionId,
      container: 'LEARN',
      subject: currentSubject,
      skillId: currentSkill.id,
      skillName: currentSkill.name,
      gradeLevel: student.gradeLevel
    });
  }, []);

  // On question submit
  const handleQuestionSubmit = async (answer, isCorrect) => {
    await journeyTrackingService.recordQuestionAttempt(
      currentSessionId,
      'LEARN',
      {
        questionId: currentQuestion.id,
        questionText: currentQuestion.text,
        studentAnswer: answer,
        correctAnswer: currentQuestion.answer,
        isCorrect,
        attemptNumber: attempts,
        timeSpent: timeElapsed,
        hintsUsed: hintsUsedCount
      }
    );
  };

  // On container complete
  const handleComplete = async () => {
    await journeyTrackingService.completeSession(currentSessionId, 'LEARN');

    // Award XP
    const xpResult = await pathiqPersistenceService.awardXP({
      amount: totalXpEarned,
      reason: `Completed ${currentSubject} LEARN`,
      category: 'learning',
      sessionId: currentSessionId,
      container: 'LEARN',
      subject: currentSubject
    });

    if (xpResult.levelUps > 0) {
      showLevelUpAnimation();
    }
  };
};
```

---

### **In StudentDashboard**

Show journey summary when all containers complete:

```typescript
// StudentDashboard.tsx
const StudentDashboard = () => {
  const [showSummary, setShowSummary] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Check if journey is complete
  useEffect(() => {
    const checkJourneyComplete = async () => {
      if (sessionId) {
        const { summary } = await journeySummaryService.getJourneySummary(sessionId);
        if (summary?.completed) {
          setShowSummary(true);
        }
      }
    };
    checkJourneyComplete();
  }, [sessionId]);

  if (showSummary && sessionId) {
    return (
      <JourneySummaryContainer
        sessionId={sessionId}
        onReturnToDashboard={() => {
          setShowSummary(false);
          setSessionId(null);
        }}
      />
    );
  }

  return <Dashboard />;
};
```

---

## 📊 Database Functions Used

These PostgreSQL functions are automatically called by the services:

### **Journey Tracking**
- No functions - direct table writes to `container_sessions`

### **PathIQ**
- `award_xp()` - Awards XP with automatic level-up
- `spend_xp()` - Deducts XP for hints
- `get_leaderboard()` - Fetches ranked players
- `calculate_streak()` - Trigger for streak calculation
- `reset_daily_xp()` - Trigger for daily XP reset

### **Journey Summary**
- `upsert_journey_summary()` - Creates/updates journey
- `update_container_progress()` - Updates specific container
- `get_journey_summary_detailed()` - Fetches full summary
- `mark_lesson_plan_generated()` - Marks PDF generated
- `calculate_journey_metrics()` - Trigger for auto-calculation

---

## 🔐 Security & Privacy

### **Row Level Security (RLS)**

All tables have RLS enabled:
- Students can only see/edit their own data
- Parents can view their children's data
- Admins can view tenant data

### **Anonymous Leaderboards**

By default, leaderboards show anonymous names:
- "Swift Explorer #1"
- "Bright Scholar #2"
- Current user sees "You" indicator

Actual names are never shown unless opt-in is implemented.

---

## 🎨 Customization

### **Adjust Auto-Save Interval**

```typescript
// In JourneyTrackingService.ts
private readonly AUTO_SAVE_INTERVAL_MS = 30000; // 30 seconds
// Change to 60000 for 1 minute, etc.
```

### **Adjust Cache TTL**

```typescript
// In PathIQPersistenceService.ts
private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// In RealLeaderboardService.ts
private readonly CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes
```

### **Leaderboard Display Limit**

```typescript
const { data } = useLeaderboard({
  limit: 50 // Show top 50 instead of 10
});
```

---

## 🚨 Error Handling

All services return structured error responses:

```typescript
const result = await journeyTrackingService.completeSession(sessionId, 'LEARN');

if (!result.success) {
  console.error('Session save failed:', result.error);
  // Show user-friendly error
  toast.error('Failed to save progress. Please try again.');
}
```

---

## ✅ Testing Checklist

Before going live, test:

- [ ] Start container session
- [ ] Record question attempts
- [ ] Award XP during session
- [ ] Complete container session
- [ ] Verify data in Supabase tables
- [ ] Update journey summary
- [ ] Complete all 3 containers
- [ ] View journey summary screen
- [ ] Check leaderboard rankings
- [ ] Verify current user rank
- [ ] Test with demo user (read-only)
- [ ] Test with multiple students
- [ ] Verify RLS policies work

---

## 🐛 Debugging

### **Enable Detailed Logging**

All services log to console. Check browser DevTools:

```
📊 Starting LEARN session tracking: K.Math.A.1
📝 Question recorded: ✓ (Score: 80%)
⭐ XP awarded: +50 (Total: 150)
✅ LEARN progress updated for session: abc-123
💾 Session saved to database: LEARN - Counting
🏆 Fetching real leaderboard data...
```

### **Check Database State**

```sql
-- Check container sessions
SELECT * FROM container_sessions WHERE session_id = 'your-session-id';

-- Check PathIQ profile
SELECT * FROM pathiq_profiles WHERE user_id = 'your-user-id';

-- Check journey summary
SELECT * FROM journey_summaries WHERE session_id = 'your-session-id';

-- Check leaderboard view
SELECT * FROM pathiq_leaderboard_view WHERE tenant_id = 'your-tenant-id';
```

---

## 📚 Next Steps

1. **Integrate container tracking** in LEARN/EXPERIENCE/DISCOVER components
2. **Wire PathIQ XP awards** after container completion
3. **Update journey summaries** as containers complete
4. **Replace mock leaderboard** with RealLeaderboardService
5. **Test complete flow** end-to-end
6. **Implement lesson plan PDF generation** service
7. **Add Azure Blob Storage** upload for lesson plans
8. **Create parent-facing** lesson plan view

---

## 🎓 Resources

- **Database Schema**: `supabase/migrations/005-007_*.sql`
- **Migration Guide**: `supabase/migrations/MIGRATION_GUIDE.md`
- **Data Architecture**: `docs/DATA_ARCHITECTURE.md`
- **Verification Queries**: `supabase/migrations/VERIFY_MIGRATIONS.sql`

---

## 💡 Tips

1. **Session IDs** should be unique per journey (not per container)
2. **Auto-save** runs every 30s - don't worry about manual saves
3. **Leaderboards cache** for 2 minutes - call `refresh()` to update
4. **XP awards** should happen AFTER session completes
5. **Journey summaries** auto-calculate metrics via triggers
6. **Demo users** are read-only - saves are blocked

---

**Questions?** Check the migration guide or service source code for detailed API documentation.
