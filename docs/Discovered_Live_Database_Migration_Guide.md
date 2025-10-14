# Discovered Live! - Database Migration Guide

**Migration Files:**
- `database/migrations/039_discovered_live_game_tables.sql` - Main schema (REQUIRED)
- `database/migrations/039b_career_clues_seed.sql` - Test seed data (OPTIONAL)

**Status:** Ready to run in Supabase
**Estimated Time:** 2-3 minutes

---

## Pre-Migration Checklist

Before running the migration, verify these prerequisites:

### ✅ Required Tables Exist
These tables must exist in your Supabase database:
- `career_paths` - Career information
- `students` - Student profiles
- `journey_summary` - Journey tracking

### ✅ Supabase Access
- [ ] You have access to Supabase SQL Editor
- [ ] You have admin/owner permissions
- [ ] Project is running and accessible

---

## Step 1: Run Main Migration

### Open Supabase SQL Editor

1. Go to your Supabase project
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

### Copy and Execute Migration

1. Open the file: `database/migrations/039_discovered_live_game_tables.sql`
2. Copy the **entire contents** (12KB file)
3. Paste into Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter)

### Expected Output

You should see:
```
Success. No rows returned
```

This means all tables, functions, and policies were created successfully.

---

## Step 2: Verify Tables Created

Run this verification query in Supabase SQL Editor:

```sql
-- Verify all Discovered Live! tables exist
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name LIKE 'dl_%'
ORDER BY table_name;
```

### Expected Output:
```
table_name    | column_count
--------------+-------------
dl_answers    | 10
dl_clues      | 13
dl_games      | 21
```

---

## Step 3: Verify Functions Created

Run this query:

```sql
-- Verify all Discovered Live! functions exist
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%dl%'
ORDER BY routine_name;
```

### Expected Output:
```
routine_name                      | routine_type
----------------------------------+-------------
get_student_dl_play_count         | FUNCTION
update_dl_clue_analytics          | FUNCTION
update_dl_game_total_xp           | FUNCTION
```

---

## Step 4: Verify RLS Policies

Run this query:

```sql
-- Verify Row Level Security policies
SELECT
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename LIKE 'dl_%'
ORDER BY tablename, policyname;
```

### Expected Output:
```
tablename   | policyname                      | cmd
------------+---------------------------------+--------
dl_answers  | dl_answers_insert_policy        | INSERT
dl_answers  | dl_answers_select_policy        | SELECT
dl_clues    | dl_clues_select_policy          | SELECT
dl_games    | dl_games_insert_policy          | INSERT
dl_games    | dl_games_select_policy          | SELECT
dl_games    | dl_games_update_policy          | UPDATE
```

---

## Step 5: Test Basic Queries

### Test 1: Check dl_clues table structure

```sql
-- View dl_clues table columns
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'dl_clues'
ORDER BY ordinal_position;
```

### Test 2: Check dl_games table structure

```sql
-- View dl_games table columns
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'dl_games'
ORDER BY ordinal_position;
```

### Test 3: Test function

```sql
-- Test the play count function (should return 0 for any student_id)
SELECT get_student_dl_play_count('00000000-0000-0000-0000-000000000000');
```

Expected: `0`

---

## Step 6: Optional - Load Test Seed Data

**⚠️ IMPORTANT:** This seed data is for **testing purposes only**. In production, clues will be AI-generated in real-time based on the student's learned skills.

### Load Seed Data

1. Open the file: `database/migrations/039b_career_clues_seed.sql`
2. Copy the **entire contents** (22KB file)
3. Paste into Supabase SQL Editor
4. Click **Run**

### Verify Seed Data Loaded

```sql
-- Check how many clues were inserted
SELECT
  grade_category,
  difficulty,
  COUNT(*) as clue_count
FROM dl_clues
GROUP BY grade_category, difficulty
ORDER BY grade_category, difficulty;
```

### Expected Output:
```
grade_category | difficulty | clue_count
---------------+------------+-----------
elementary     | easy       | ~40
elementary     | medium     | ~20
elementary     | hard       | ~20
```

---

## Verification Checklist

After running the migration, check off each item:

### Tables
- [ ] `dl_clues` table exists with 13 columns
- [ ] `dl_games` table exists with 21 columns
- [ ] `dl_answers` table exists with 10 columns

### Indexes
- [ ] `idx_dl_clues_career` exists
- [ ] `idx_dl_clues_difficulty_grade` exists
- [ ] `idx_dl_games_student` exists
- [ ] `idx_dl_games_journey` exists
- [ ] `idx_dl_answers_game` exists
- [ ] `idx_dl_answers_clue` exists

### Functions
- [ ] `update_dl_game_total_xp()` exists
- [ ] `update_dl_clue_analytics()` exists
- [ ] `get_student_dl_play_count()` exists

### Triggers
- [ ] `trigger_update_dl_game_total_xp` exists on `dl_games`
- [ ] `trigger_update_dl_clue_analytics` exists on `dl_answers`

### RLS Policies
- [ ] `dl_clues_select_policy` exists
- [ ] `dl_games_select_policy` exists
- [ ] `dl_games_insert_policy` exists
- [ ] `dl_games_update_policy` exists
- [ ] `dl_answers_select_policy` exists
- [ ] `dl_answers_insert_policy` exists

### Permissions
- [ ] `authenticated` role can SELECT from `dl_clues`
- [ ] `authenticated` role can SELECT, INSERT, UPDATE on `dl_games`
- [ ] `authenticated` role can SELECT, INSERT on `dl_answers`

---

## Sample Data Test Queries

Once the migration is complete, you can test with these queries:

### Test 1: Create a Test Game

```sql
-- Create a test game (replace student_id with a real UUID from your students table)
INSERT INTO dl_games (
  student_id,
  bingo_grid,
  total_questions,
  status
) VALUES (
  (SELECT id FROM students LIMIT 1), -- Use first student for testing
  '{
    "careers": [
      ["CHEF", "TEACHER", "DOCTOR", "ENGINEER"],
      ["FARMER", "ARTIST", "PILOT", "MUSICIAN"],
      ["CHEF", "LAWYER", "SCIENTIST", "ATHLETE"],
      ["WRITER", "NURSE", "PROGRAMMER", "ARCHITECT"]
    ],
    "userCareerPosition": {"row": 0, "col": 0}
  }'::jsonb,
  12,
  'in_progress'
)
RETURNING id, student_id, status;
```

### Test 2: Query Games

```sql
-- View all games
SELECT
  id,
  student_id,
  status,
  correct_answers,
  total_xp,
  started_at
FROM dl_games
ORDER BY started_at DESC
LIMIT 5;
```

### Test 3: Test XP Calculation

```sql
-- Update a game's XP fields and watch the trigger calculate total_xp
UPDATE dl_games
SET
  base_xp_earned = 100,
  bingo_bonus_xp = 50,
  streak_bonus_xp = 25
WHERE id = (SELECT id FROM dl_games LIMIT 1)
RETURNING id, base_xp_earned, bingo_bonus_xp, streak_bonus_xp, total_xp;
```

Expected: `total_xp` should equal 175 (100 + 50 + 25)

---

## Troubleshooting

### Error: "relation already exists"

**Problem:** Tables already exist from a previous migration attempt

**Solution:**
```sql
-- Drop existing tables if you want to start fresh
DROP TABLE IF EXISTS dl_answers CASCADE;
DROP TABLE IF EXISTS dl_games CASCADE;
DROP TABLE IF EXISTS dl_clues CASCADE;

-- Then re-run the migration
```

### Error: "constraint violation"

**Problem:** Foreign key references to tables that don't exist

**Solution:** Verify these tables exist:
```sql
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('career_paths', 'students', 'journey_summary');
```

If any are missing, you need to run their migrations first.

### Error: "permission denied"

**Problem:** RLS policies are blocking access

**Solution:**
- Make sure you're testing with an authenticated user
- Or temporarily disable RLS for testing:
```sql
ALTER TABLE dl_clues DISABLE ROW LEVEL SECURITY;
ALTER TABLE dl_games DISABLE ROW LEVEL SECURITY;
ALTER TABLE dl_answers DISABLE ROW LEVEL SECURITY;
```

**⚠️ Remember to re-enable RLS before production:**
```sql
ALTER TABLE dl_clues ENABLE ROW LEVEL SECURITY;
ALTER TABLE dl_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE dl_answers ENABLE ROW LEVEL SECURITY;
```

---

## Post-Migration Setup

### Grant API Access (if needed)

If you're using Supabase's auto-generated API:

```sql
-- Ensure PostgREST can access tables
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

GRANT SELECT ON dl_clues TO anon;
GRANT SELECT ON dl_clues TO authenticated;

GRANT SELECT, INSERT, UPDATE ON dl_games TO authenticated;
GRANT SELECT, INSERT ON dl_answers TO authenticated;
```

### Set Up Realtime (optional)

If you want real-time updates for multiplayer features:

```sql
-- Enable realtime for tables (in Supabase Dashboard)
-- Database → Replication → Enable for dl_games, dl_answers
```

---

## Rollback Instructions

If you need to rollback the migration:

```sql
-- Drop all Discovered Live! objects
DROP TRIGGER IF EXISTS trigger_update_dl_clue_analytics ON dl_answers;
DROP TRIGGER IF EXISTS trigger_update_dl_game_total_xp ON dl_games;

DROP FUNCTION IF EXISTS update_dl_clue_analytics();
DROP FUNCTION IF EXISTS update_dl_game_total_xp();
DROP FUNCTION IF EXISTS get_student_dl_play_count(UUID);

DROP TABLE IF EXISTS dl_answers CASCADE;
DROP TABLE IF EXISTS dl_games CASCADE;
DROP TABLE IF EXISTS dl_clues CASCADE;
```

---

## Next Steps

Once the database migration is complete:

1. ✅ **Verify all tables exist** - Run verification queries above
2. ✅ **Test basic queries** - Try the sample queries
3. ✅ **Check RLS policies** - Ensure security is working
4. 🔜 **Build Service Layer** - Create `DiscoveredLiveService.ts`
5. 🔜 **Build UI Components** - Create game screens
6. 🔜 **Integrate with Journey** - Connect to DISCOVER container

---

## Support & Documentation

**Migration File:** `database/migrations/039_discovered_live_game_tables.sql`
**Type Definitions:** `src/types/DiscoveredLiveTypes.ts`
**Naming Conventions:** `docs/NAMING_CONVENTIONS.md`
**UI Design Guide:** `docs/Discovered_Live_UI_Design_Guide.md`

---

**Migration Guide Version:** 1.0
**Last Updated:** 2025-10-11
**Status:** ✅ Ready for Production
