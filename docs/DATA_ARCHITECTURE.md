# Pathfinity Data Architecture
**Journey Tracking → PathIQ → Leaderboard → Storage Integration**

## 📊 Current State Overview

### Existing Storage Systems

#### 1. Supabase (PostgreSQL) - User Data & Analytics
✅ **Already Implemented:**
- `learning_journeys` - Overall journey tracking (career, companion, progress)
- `skill_authority_tracking` - Which skills completed by whom
- `grade_progression_tracking` - Grade advancement tracking
- `remediation_queue` - Skills needing remediation
- `journey_sync_metadata` - Cross-device synchronization
- `parent_override_audit` - Audit log of parent actions
- `analytics_events` - PathIQ event tracking
- Analytics views: career_analytics, companion_analytics, skill_analytics, journey_analytics

#### 2. Azure Blob Storage - Content & Rubrics
✅ **Already Implemented:**
- `audio-narration` - AI companion audio files
- `master-narratives` - Story rubrics
- `micro-content-learn/experience/discover` - Micro-learning content
- `enriched-narratives` - Enriched master narratives
- `story-rubrics` - Story rubric templates
- `data-rubrics` - Data rubric templates
- `content-metrics` - Content performance metrics

#### 3. PathIQ Gamification Service (In-Memory)
✅ **Already Implemented:**
- XP tracking and awards
- Level progression
- Achievements
- Hint economy
- Streak tracking
- User game profiles

---

## ❌ What's Missing for Complete Integration

### 1. **Container Session Tracking**
Need detailed tracking for LEARN → EXPERIENCE → DISCOVER sessions:
```typescript
interface ContainerSession {
  sessionId: string;
  userId: string;
  container: 'LEARN' | 'EXPERIENCE' | 'DISCOVER';
  subject: 'Math' | 'ELA' | 'Science' | 'Social Studies';
  skillId: string;

  // Performance
  questionsAttempted: number;
  questionsCorrect: number;
  score: number;
  timeSpent: number;
  attempts: number;

  // XP & Gamification
  xpEarned: number;
  hintsUsed: number;
  achievementsUnlocked: string[];

  // Detailed question history
  questionHistory: QuestionAttempt[];

  completedAt: string;
}
```

### 2. **PathIQ Profile Persistence**
PathIQ currently stores profiles in memory - need Supabase table:
```sql
CREATE TABLE pathiq_profiles (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  next_level_xp INTEGER DEFAULT 100,
  streak_days INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  achievements JSONB DEFAULT '[]',
  daily_xp_earned INTEGER DEFAULT 0,
  lifetime_xp INTEGER DEFAULT 0,
  hints_used_today INTEGER DEFAULT 0,
  free_hints_remaining INTEGER DEFAULT 10,
  pathiq_rank INTEGER,
  pathiq_tier VARCHAR(50),
  last_active DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);
```

### 3. **XP Transaction History**
For leaderboard and analytics:
```sql
CREATE TABLE xp_transactions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'earned' | 'spent'
  reason TEXT NOT NULL,
  category VARCHAR(20) NOT NULL, -- 'learning' | 'hint' | 'achievement' | 'streak' | 'bonus'
  balance INTEGER NOT NULL,
  pathiq_verified BOOLEAN DEFAULT true,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. **Journey Summary Data**
For lesson plan generation and summary screen:
```sql
CREATE TABLE journey_summaries (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id VARCHAR(255) NOT NULL UNIQUE,
  grade_level VARCHAR(10) NOT NULL,
  career VARCHAR(100) NOT NULL,
  companion VARCHAR(100) NOT NULL,

  -- Overall metrics
  total_xp_earned INTEGER DEFAULT 0,
  total_time_spent INTEGER DEFAULT 0, -- seconds
  overall_score DECIMAL(5,2) DEFAULT 0,
  skills_mastered INTEGER DEFAULT 0,
  skills_attempted INTEGER DEFAULT 0,

  -- Container progress (JSONB)
  learn_progress JSONB DEFAULT '{}',
  experience_progress JSONB DEFAULT '{}',
  discover_progress JSONB DEFAULT '{}',

  -- Timestamps
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔄 Complete Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    STUDENT LEARNING JOURNEY                      │
│         LEARN → EXPERIENCE → DISCOVER (4 subjects each)          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│              1. JOURNEY TRACKING SERVICE                         │
│  • Collects real-time performance data                           │
│  • Tracks questions attempted/correct                            │
│  • Records time spent per container/subject                      │
│  • Monitors attempts and retries                                 │
│  • Writes to Supabase: container_sessions table                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓ reports to
┌─────────────────────────────────────────────────────────────────┐
│              2. PathIQ GAMIFICATION SERVICE                      │
│  • Receives journey data from tracking service                   │
│  • Awards XP based on performance:                               │
│    - correctFirstTry: 10 XP                                      │
│    - correctSecondTry: 5 XP                                      │
│    - lessonComplete: 20 XP                                       │
│    - perfectScore: 50 XP                                         │
│  • Calculates level progression                                  │
│  • Unlocks achievements                                          │
│  • Manages streak bonuses                                        │
│  • Handles hint economy (XP spending)                            │
│  • Writes to Supabase:                                           │
│    - pathiq_profiles table                                       │
│    - xp_transactions table                                       │
│    - analytics_events table                                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓ feeds into
┌─────────────────────────────────────────────────────────────────┐
│              3. LEADERBOARD SERVICE                              │
│  • Reads PathIQ profiles from Supabase                           │
│  • Ranks users by:                                               │
│    - Total XP                                                    │
│    - Current level                                               │
│    - Streak days                                                 │
│    - Achievements count                                          │
│  • Filters by: tenant, grade, career (optional)                 │
│  • Currently: mocked data                                        │
│  • Production: real-time queries from pathiq_profiles            │
│  • Cached in Redis for performance                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓ stored in
┌─────────────────────────────────────────────────────────────────┐
│              4. AZURE BLOB STORAGE                               │
│  • Journey Summary PDFs (parent lesson plans)                    │
│  • Historical session data (compressed JSON)                     │
│  • Performance reports                                           │
│  • Backup of PathIQ profiles (nightly snapshot)                  │
│  Container: journey-summaries/                                   │
│  Path: {userId}/{sessionId}/summary.pdf                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔗 Integration Points

### A. During Active Learning (Real-time)

```typescript
// 1. Student completes a question in LEARN container
const questionResult = {
  containerId: 'LEARN',
  subject: 'Math',
  correct: true,
  timeSpent: 45, // seconds
  hintsUsed: 0,
  attempt: 1
};

// 2. Journey Tracking Service records it
await journeyTrackingService.recordQuestionAttempt(userId, questionResult);

// 3. PathIQ awards XP immediately
const xpAwarded = pathIQGamificationService.awardXP(
  userId,
  10, // correctFirstTry
  'Math LEARN question completed',
  'learning'
);

// 4. Update Supabase in background
await supabase.from('container_sessions').insert({
  user_id: userId,
  container: 'LEARN',
  subject: 'Math',
  questions_correct: 1,
  xp_earned: 10,
  // ... other fields
});

// 5. Leaderboard auto-updates from pathiq_profiles trigger
```

### B. After Container Completion

```typescript
// When LEARN container finishes all 4 subjects
await journeyTrackingService.completeContainer(userId, 'LEARN');

// PathIQ checks for achievements
pathIQGamificationService.checkAchievements(userId);
// Might unlock: "Math Master", "Quick Learner", etc.

// Update journey summary
await supabase.from('journey_summaries').update({
  learn_progress: learnData,
  total_xp_earned: totalXP
}).eq('session_id', sessionId);
```

### C. After Journey Completion (All 3 Containers)

```typescript
// Show JourneySummaryScreen with data from:
const summaryData = {
  // From journey_summaries table
  totalXPEarned: session.total_xp_earned,
  overallScore: session.overall_score,

  // From container_sessions table (joined)
  containerProgress: {
    LEARN: learnSessions,
    EXPERIENCE: experienceSessions,
    DISCOVER: discoverSessions
  },

  // From pathiq_profiles table
  level: pathiqProfile.level,
  achievements: pathiqProfile.achievements
};

// Generate lesson plan PDF
const lessonPlan = await lessonPlanGenerator.generate(summaryData);

// Upload to Azure
await azureStorageService.uploadLessonPlan(
  userId,
  sessionId,
  lessonPlan
);
```

### D. Parent Access (Days/Weeks Later)

```typescript
// Parent logs in, views child's history
const sessions = await supabase
  .from('journey_summaries')
  .select('*')
  .eq('user_id', studentId)
  .order('start_time', { ascending: false });

// Download lesson plan PDF from Azure
const pdfUrl = await azureStorageService.getLessonPlanUrl(
  studentId,
  sessionId
);
```

---

## 📝 Implementation Checklist

### Phase 1: Database Schema (Supabase)
- [ ] Create `container_sessions` table
- [ ] Create `pathiq_profiles` table
- [ ] Create `xp_transactions` table
- [ ] Create `journey_summaries` table
- [ ] Add indexes for performance
- [ ] Add RLS policies

### Phase 2: Journey Tracking Service
- [ ] Create `JourneyTrackingService.ts`
- [ ] Implement `recordQuestionAttempt()`
- [ ] Implement `recordContainerCompletion()`
- [ ] Implement `recordSessionSummary()`
- [ ] Integrate with PathIQ service

### Phase 3: PathIQ Persistence
- [ ] Extend PathIQ to write to Supabase
- [ ] Migrate `getUserProfile()` to read from DB
- [ ] Migrate `awardXP()` to write transactions
- [ ] Add profile sync on startup
- [ ] Cache profiles in memory for performance

### Phase 4: Leaderboard Real Data
- [ ] Update LeaderboardService to query Supabase
- [ ] Replace mocked data with real queries
- [ ] Add Redis caching layer
- [ ] Implement tenant/grade/career filters

### Phase 5: Azure Storage Integration
- [ ] Add `journey-summaries` container
- [ ] Implement lesson plan PDF upload
- [ ] Implement session data archival
- [ ] Add nightly PathIQ profile backup

### Phase 6: Summary & Lesson Plan
- [ ] Wire JourneySummaryScreen to real data
- [ ] Create `LessonPlanGeneratorService.ts`
- [ ] Integrate with StudentDashboard flow
- [ ] Add "Generate Lesson Plan" button functionality

---

## 🎯 Key Design Principles

1. **Single Source of Truth**: Supabase PostgreSQL is the authoritative data store
2. **Performance**: PathIQ profiles cached in memory during active sessions
3. **Reliability**: Write to DB after every significant event (container completion, XP award)
4. **Cross-Device**: `journey_sync_metadata` table enables device switching
5. **Parent Access**: Azure Blob Storage provides durable, accessible lesson plans
6. **Analytics**: `analytics_events` table feeds PathIQ intelligence system
7. **Audit Trail**: All XP transactions and parent overrides are logged

---

## 🔐 Security & Privacy

- **RLS Policies**: Students can only see own data
- **Parent Access**: Parents linked via `family_relationships` table
- **Tenant Isolation**: All queries filtered by `tenant_id`
- **Azure SAS Tokens**: Time-limited access to lesson plan PDFs
- **Encrypted at Rest**: Both Supabase and Azure use encryption
- **GDPR Compliant**: Data deletion cascades across all tables

---

## 📈 Scalability Considerations

- **Partitioning**: `analytics_events` table partitioned by month
- **Archival**: Sessions older than 1 year moved to Azure cold storage
- **Read Replicas**: Leaderboard queries hit read replica
- **CDN**: Azure Blob Storage fronted by CDN for global access
- **Connection Pooling**: Supabase connection pool sized for 1000 concurrent users per tenant
