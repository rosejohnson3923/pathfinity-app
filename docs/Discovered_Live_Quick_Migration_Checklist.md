# Discovered Live! - Quick Migration Checklist

**Print this page and check off as you go!**

---

## ☑️ Pre-Migration

- [ ] Supabase SQL Editor is open
- [ ] You have the migration file ready: `database/migrations/039_discovered_live_game_tables.sql`
- [ ] You have admin access

---

## ☑️ Run Migration

- [ ] Copy entire contents of `039_discovered_live_game_tables.sql`
- [ ] Paste into Supabase SQL Editor
- [ ] Click **Run** (or Ctrl+Enter)
- [ ] See "Success. No rows returned" message

---

## ☑️ Verify Tables

Run this query:
```sql
SELECT table_name,
       (SELECT COUNT(*) FROM information_schema.columns
        WHERE table_name = t.table_name) as columns
FROM information_schema.tables t
WHERE table_schema = 'public' AND table_name LIKE 'dl_%'
ORDER BY table_name;
```

Expected results:
- [ ] `dl_answers` - 10 columns
- [ ] `dl_clues` - 13 columns
- [ ] `dl_games` - 21 columns

---

## ☑️ Verify Functions

Run this query:
```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name LIKE '%dl%'
ORDER BY routine_name;
```

Expected results:
- [ ] `get_student_dl_play_count`
- [ ] `update_dl_clue_analytics`
- [ ] `update_dl_game_total_xp`

---

## ☑️ Verify RLS Policies

Run this query:
```sql
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE tablename LIKE 'dl_%'
GROUP BY tablename
ORDER BY tablename;
```

Expected results:
- [ ] `dl_answers` - 2 policies
- [ ] `dl_clues` - 1 policy
- [ ] `dl_games` - 3 policies

---

## ☑️ Test Queries

### Test 1: View table structure
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'dl_clues'
ORDER BY ordinal_position;
```
- [ ] Returns 13 rows

### Test 2: Test function
```sql
SELECT get_student_dl_play_count('00000000-0000-0000-0000-000000000000');
```
- [ ] Returns `0`

### Test 3: Check permissions
```sql
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'dl_clues'
  AND grantee = 'authenticated';
```
- [ ] Returns `SELECT` permission

---

## ☑️ Optional: Load Seed Data

**Only for testing! Production uses AI-generated clues.**

- [ ] Copy contents of `039b_career_clues_seed.sql`
- [ ] Paste into Supabase SQL Editor
- [ ] Click **Run**
- [ ] Query: `SELECT COUNT(*) FROM dl_clues;`
- [ ] Should return ~80 rows

---

## ✅ Migration Complete!

All checkboxes marked? You're ready to build the service layer!

**Next Steps:**
1. Build `DiscoveredLiveService.ts`
2. Build UI components
3. Integrate with Journey

---

**Need Help?** See full guide: `docs/Discovered_Live_Database_Migration_Guide.md`
