# Database Migration Guide
**Journey Tracking → PathIQ → Leaderboard Integration**

## 📋 Overview

These migrations create the persistent storage layer for:
- ✅ Detailed container session tracking (LEARN, EXPERIENCE, DISCOVER)
- ✅ PathIQ gamification profiles (XP, levels, achievements)
- ✅ XP transaction history (audit trail)
- ✅ Journey summaries (for lesson plans and summary screen)
- ✅ Real leaderboard data (not mocked)

## 🗂️ Migration Files

### 005_container_sessions_tracking.sql
**Purpose:** Track detailed performance in each container session

**Creates:**
- `container_sessions` table - Records every LEARN/EXPERIENCE/DISCOVER session
- Helper functions: `get_user_container_average()`, `get_session_total_xp()`
- Analytics view: `container_performance_analytics`

**Key Fields:**
- Question-level tracking (attempts, correct/incorrect, time)
- XP earned per session
- Hints used
- Complete question history in JSONB format

### 006_pathiq_profiles_persistence.sql
**Purpose:** Persistent storage for PathIQ gamification system

**Creates:**
- `pathiq_profiles` table - User XP, levels, achievements, streaks
- `xp_transactions` table - Immutable transaction log
- Helper functions: `award_xp()`, `spend_xp()`, `get_leaderboard()`
- Analytics views: `pathiq_leaderboard_view`, `xp_analytics_view`

**Key Features:**
- Automatic level-up calculation
- Streak tracking with daily reset
- Achievement storage
- Leaderboard queries with tenant/grade filtering

### 007_journey_summaries.sql
**Purpose:** Overall session summaries for lesson plans

**Creates:**
- `journey_summaries` table - Complete journey metadata
- Helper functions: `upsert_journey_summary()`, `update_container_progress()`
- Analytics views: `journey_completion_analytics`, `lesson_plan_analytics`

**Key Features:**
- Aggregates data from all 3 containers
- Stores lesson plan PDF URL (Azure)
- Auto-calculates overall metrics from container progress
- Tracks lesson plan generation status

## 🚀 How to Run Migrations

### Option 1: Supabase Dashboard (Recommended for Testing)

1. **Open Supabase Dashboard**
   - Go to your project at https://app.supabase.com
   - Navigate to **SQL Editor**

2. **Run migrations in order:**
   ```
   1. Run 005_container_sessions_tracking.sql
   2. Run 006_pathiq_profiles_persistence.sql
   3. Run 007_journey_summaries.sql
   ```

3. **Verify tables created:**
   - Navigate to **Table Editor**
   - Should see new tables:
     - `container_sessions`
     - `pathiq_profiles`
     - `xp_transactions`
     - `journey_summaries`

### Option 2: Supabase CLI (Recommended for Production)

```bash
# Make sure you're in the project directory
cd /mnt/c/Users/rosej/Documents/Projects/pathfinity-app

# Run all new migrations
supabase db push

# Or run individually
supabase db execute --file supabase/migrations/005_container_sessions_tracking.sql
supabase db execute --file supabase/migrations/006_pathiq_profiles_persistence.sql
supabase db execute --file supabase/migrations/007_journey_summaries.sql
```

### Option 3: Direct PostgreSQL Connection

```bash
# Using psql
psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" \
  -f supabase/migrations/005_container_sessions_tracking.sql

psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" \
  -f supabase/migrations/006_pathiq_profiles_persistence.sql

psql "postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres" \
  -f supabase/migrations/007_journey_summaries.sql
```

## ✅ Post-Migration Verification

### 1. Check Tables Exist

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'container_sessions',
    'pathiq_profiles',
    'xp_transactions',
    'journey_summaries'
  );
```

Should return 4 rows.

### 2. Check Indexes Created

```sql
SELECT indexname
FROM pg_indexes
WHERE tablename IN (
  'container_sessions',
  'pathiq_profiles',
  'xp_transactions',
  'journey_summaries'
);
```

Should return 20+ indexes.

### 3. Check Functions Created

```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'award_xp',
    'spend_xp',
    'get_leaderboard',
    'get_user_container_average',
    'update_container_progress'
  );
```

Should return 5+ functions.

### 4. Test Data Insertion

```sql
-- Test PathIQ profile creation
SELECT award_xp(
  auth.uid(),
  'test-tenant',
  10,
  'Test XP award',
  'learning'
);

-- Check profile created
SELECT * FROM pathiq_profiles WHERE user_id = auth.uid();

-- Check transaction recorded
SELECT * FROM xp_transactions WHERE user_id = auth.uid();
```

## 🔒 Row Level Security (RLS) Policies

All tables have RLS enabled with these policies:

### Students
- ✅ Can view their own data
- ✅ Can insert their own data
- ✅ Can update their own data
- ❌ Cannot view other students' data

### Parents (Optional - Uncomment in migrations)
- ✅ Can view their children's data via `family_relationships` table
- ❌ Cannot modify children's data

### Admins (Optional - Uncomment in migrations)
- ✅ Can view all data in their tenant
- ✅ Can generate reports

## 📊 Sample Queries

### Leaderboard (Top 10 by XP)
```sql
SELECT * FROM get_leaderboard('school-xyz', 'K', 10);
```

### Student Progress Summary
```sql
SELECT
  js.student_name,
  js.overall_score,
  js.total_xp_earned,
  pp.level,
  pp.streak_days
FROM journey_summaries js
JOIN pathiq_profiles pp ON js.user_id = pp.user_id
WHERE js.user_id = 'user-abc'
ORDER BY js.start_time DESC;
```

### Container Performance by Subject
```sql
SELECT * FROM container_performance_analytics
WHERE tenant_id = 'school-xyz'
  AND grade_level = 'K'
ORDER BY avg_score DESC;
```

### XP Earned Over Time
```sql
SELECT
  date,
  category,
  total_xp,
  unique_users
FROM xp_analytics_view
WHERE tenant_id = 'school-xyz'
  AND date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY date DESC, total_xp DESC;
```

## 🧪 Testing Strategy

### 1. Create Test User Profile
```sql
INSERT INTO pathiq_profiles (user_id, tenant_id, xp, level)
VALUES ('test-user-123', 'test-tenant', 0, 1);
```

### 2. Simulate Learning Session
```sql
-- Start journey summary
SELECT upsert_journey_summary(
  'test-user-123'::uuid,
  'test-tenant',
  'session-test-123',
  'Test Student',
  'K',
  'chef',
  'Chef',
  'finn',
  'Finn'
);

-- Record container session
INSERT INTO container_sessions (
  user_id, tenant_id, session_id,
  container, subject, skill_id, skill_name, grade_level,
  questions_attempted, questions_correct, score, time_spent, xp_earned
) VALUES (
  'test-user-123'::uuid, 'test-tenant', 'session-test-123',
  'LEARN', 'Math', 'K.Math.A.1', 'Counting', 'K',
  5, 4, 80, 180, 25
);

-- Award XP
SELECT award_xp(
  'test-user-123'::uuid,
  'test-tenant',
  25,
  'Math LEARN completed',
  'learning',
  'session-test-123',
  'LEARN',
  'Math',
  'K.Math.A.1'
);
```

### 3. Verify Data Consistency
```sql
-- Check XP matches between tables
SELECT
  pp.xp AS profile_xp,
  SUM(xt.amount) AS transaction_total,
  SUM(cs.xp_earned) AS container_total
FROM pathiq_profiles pp
LEFT JOIN xp_transactions xt ON pp.user_id = xt.user_id AND xt.type = 'earned'
LEFT JOIN container_sessions cs ON pp.user_id = cs.user_id
WHERE pp.user_id = 'test-user-123'::uuid
GROUP BY pp.xp;
```

## ⚠️ Important Notes

### 1. Dependencies
- Requires existing `update_updated_at_column()` function from previous migrations
- Uses `auth.uid()` for RLS - requires Supabase Auth enabled

### 2. Data Size Considerations
- `question_history` JSONB can grow large (50KB+ per session)
- Consider archiving old sessions to Azure after 90 days
- See `DATA_ARCHITECTURE.md` for archival strategy

### 3. Performance
- All critical queries have indexes
- Views are materialized for fast leaderboard queries
- Consider adding `pg_stat_statements` for query monitoring

### 4. Backup Strategy
- Supabase provides daily backups
- Consider additional nightly backups to Azure
- Test restore procedures regularly

## 🔄 Rollback Plan

If you need to rollback these migrations:

```sql
-- WARNING: This will delete all data in these tables!

-- Drop tables (cascade removes dependent objects)
DROP TABLE IF EXISTS journey_summaries CASCADE;
DROP TABLE IF EXISTS xp_transactions CASCADE;
DROP TABLE IF EXISTS pathiq_profiles CASCADE;
DROP TABLE IF EXISTS container_sessions CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS award_xp CASCADE;
DROP FUNCTION IF EXISTS spend_xp CASCADE;
DROP FUNCTION IF EXISTS get_leaderboard CASCADE;
DROP FUNCTION IF EXISTS get_user_container_average CASCADE;
DROP FUNCTION IF EXISTS update_container_progress CASCADE;
DROP FUNCTION IF EXISTS upsert_journey_summary CASCADE;
DROP FUNCTION IF EXISTS calculate_journey_metrics CASCADE;
DROP FUNCTION IF EXISTS reset_daily_xp CASCADE;
DROP FUNCTION IF EXISTS calculate_streak CASCADE;
```

## 📞 Support

If you encounter issues:
1. Check Supabase logs in Dashboard → Logs
2. Verify RLS policies aren't blocking queries
3. Ensure `auth.uid()` returns valid UUID
4. Check for syntax errors in custom SQL
5. Review `DATA_ARCHITECTURE.md` for integration details

## 🎯 Next Steps After Migration

1. **Create JourneyTrackingService** - Writes to `container_sessions`
2. **Extend PathIQ Service** - Reads/writes `pathiq_profiles`
3. **Update Leaderboard** - Queries `pathiq_leaderboard_view`
4. **Wire Summary Screen** - Reads `journey_summaries`
5. **Build Lesson Plan Generator** - Uses summary data + Azure storage

See `docs/DATA_ARCHITECTURE.md` for complete implementation plan.
