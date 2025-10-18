# Career Challenge Multiplayer (CCM) Database Migrations

**Created:** October 16, 2025
**Status:** Phase 1 - Database Setup

---

## Overview

This directory contains **5 migration files** for **Career Challenge Multiplayer (CCM)** - a perpetual room-based multiplayer game mode that is completely separate from the existing Career Challenge (CC) single-player mode.

---

## Architecture Separation

### **CC (Existing - Keep As-Is)**
- Tables: `cc_*` prefix
- Route: `/discovered-live/career-challenge`
- Status: ✅ Working in production

### **CCM (New - Building Now)**
- Tables: `ccm_*` prefix
- Route: `/discovered-live/career-challenge-multiplayer`
- Status: 🚧 In Development

**Important:** CCM shares **NOTHING** with CC. Complete table separation allows us to deprecate either mode later without affecting the other.

---

## Migration Files

### 1. `20251016_10_create_ccm_perpetual_rooms.sql`
**Tables Created:**
- `ccm_perpetual_rooms` - Always-on game rooms (24/7 operation)

**Features:**
- 3 featured rooms seeded: Global, Skills, Casual
- Room codes: `CCM_GLOBAL01`, `CCM_SKILLS01`, `CCM_CASUAL01`
- Status tracking: active (game running) or intermission (15s break)
- AI fill configuration

**Indexes:** 4 indexes for query optimization

---

### 2. `20251016_11_create_ccm_game_sessions.sql`
**Tables Created:**
- `ccm_game_sessions` - Individual 5-round games
- `ccm_session_participants` - Players (human + AI) in games

**Features:**
- Game sessions cycle continuously within rooms
- Participants can be human or AI agents
- Hand management: 10 role cards + 5 synergy cards
- XP conversion: 10:1 ratio (score ÷ 10)

**Indexes:** 6 indexes

---

### 3. `20251016_12_create_ccm_content_tables.sql`
**Tables Created:**
- `ccm_role_cards` - 50 career role cards
- `ccm_synergy_cards` - 5 universal soft skills cards
- `ccm_challenge_cards` - Business problem cards (6 P categories)
- `ccm_soft_skills_matrix` - 🔒 **TRADE SECRET** with RLS protection

**Security:**
- `ccm_soft_skills_matrix` has Row Level Security enabled
- Frontend CANNOT access multiplier values
- Only backend service role can query

**Indexes:** 15 indexes + RLS policy

---

### 4. `20251016_13_create_ccm_gameplay_tables.sql`
**Tables Created:**
- `ccm_round_plays` - Card selections and scoring per round
- `ccm_mvp_selections` - MVP card carry-overs

**Features:**
- Multi-dimensional scoring formula
- Validation constraints for valid card combinations
- Hidden soft skills multipliers (0.95-1.15)

**Indexes:** 6 indexes

---

### 5. `20251016_14_create_ccm_achievement_tables.sql`
**Tables Created:**
- `ccm_achievements` - 32 achievement definitions
- `ccm_player_achievements` - Player progress tracking

**Security:**
- RLS enabled on player achievements
- Players can only see their own progress

**Indexes:** 8 indexes

---

## Running Migrations

### Method 1: Supabase Dashboard (Recommended)

1. Go to: https://supabase.com/dashboard/project/zohdmprtfyijneqnwjsu/sql/new
2. Copy contents of each migration file in order (10 → 11 → 12 → 13 → 14)
3. Run each one separately
4. Verify success messages

### Method 2: Combined SQL File

Create a combined file and run all at once:

```bash
cat supabase/migrations/20251016_10_create_ccm_perpetual_rooms.sql \
    supabase/migrations/20251016_11_create_ccm_game_sessions.sql \
    supabase/migrations/20251016_12_create_ccm_content_tables.sql \
    supabase/migrations/20251016_13_create_ccm_gameplay_tables.sql \
    supabase/migrations/20251016_14_create_ccm_achievement_tables.sql \
    > supabase/migrations/CCM_ALL_MIGRATIONS.sql
```

Then run the combined file in Supabase Dashboard.

---

## Verification

After running migrations, verify the schema:

```sql
-- Check all CCM tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'ccm_%'
ORDER BY table_name;

-- Should return 11 tables:
-- ccm_achievements
-- ccm_challenge_cards
-- ccm_game_sessions
-- ccm_mvp_selections
-- ccm_perpetual_rooms
-- ccm_player_achievements
-- ccm_role_cards
-- ccm_round_plays
-- ccm_session_participants
-- ccm_soft_skills_matrix
-- ccm_synergy_cards

-- Check RLS is enabled on protected tables
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('ccm_soft_skills_matrix', 'ccm_player_achievements');
-- Both should return: rowsecurity = t (true)

-- Check featured rooms were seeded
SELECT room_code, room_name, is_featured
FROM ccm_perpetual_rooms
WHERE is_featured = true
ORDER BY feature_order;
-- Should return 3 rooms
```

---

## Schema Summary

**Total Tables:** 11
**Total Indexes:** 34+
**Trade Secret Tables:** 1 (`ccm_soft_skills_matrix` with RLS)
**Foreign Keys:** 18+
**Check Constraints:** 45+

**Database Size Estimate:**
- Empty schema: ~500 KB
- With all content: ~3-4 MB
- With 1000 games played: ~15-20 MB

---

## Next Steps

### 1. Content Generation (Week 3-4)

**Required Content:**
- [ ] 50 Role cards (`ccm_role_cards`)
  - 10 per C-Suite org (CEO, CFO, CMO, CTO, CHRO)
  - Each with quality ratings for 6 P problems
- [ ] 5 Synergy cards (`ccm_synergy_cards`)
  - Captain Connector, Strategy Savant, Creative Catalyst, Detail Detective, Growth Guardian
- [ ] 30+ Challenge cards (`ccm_challenge_cards`)
  - 5+ per P category (People, Product, Process, Place, Promotion, Price)
- [ ] 🔒 250 Soft skills matrix combinations (`ccm_soft_skills_matrix`)
  - **TRADE SECRET** - Restricted access only
- [ ] 32 Achievement definitions (`ccm_achievements`)
  - 5 categories: Discovery, Strategy, Exploration, Social, Mastery

### 2. Backend Services (Week 2)

**Services to Build:**
- [ ] `CCMPerpetualRoomManager.ts` - Room lifecycle management
- [ ] `CCMGameOrchestrator.ts` - 5-round game loop
- [ ] `CCMScoringService.ts` - Multi-dimensional scoring calculator
- [ ] `CCMCardGenerationService.ts` - Hand generation and validation
- [ ] `CCAIDecisionService.ts` - Multi-card AI strategy
- [ ] `CCMAchievementService.ts` - Achievement tracking
- [ ] `CCMReplayService.ts` - Game replay data generation

### 3. API Endpoints (Week 3)

**Endpoints to Create:**
- [ ] `GET /api/ccm/rooms` - List featured perpetual rooms
- [ ] `POST /api/ccm/rooms/:roomId/join` - Join room
- [ ] `POST /api/ccm/game/:sessionId/c-suite-select` - Submit C-Suite choice
- [ ] `POST /api/ccm/game/:sessionId/card-select` - Submit card selection
- [ ] `POST /api/ccm/game/:sessionId/lock-in` - Lock in selection
- [ ] `POST /api/ccm/game/:sessionId/mvp-select` - Select MVP
- [ ] `GET /api/ccm/game/:sessionId/leaderboard` - Get leaderboard
- [ ] `GET /api/ccm/game/:sessionId/replay` - Get replay data
- [ ] `GET /api/ccm/achievements/:studentId` - Get player achievements

---

## Rollback

If you need to rollback CCM migrations:

```sql
-- Drop all CCM tables in reverse order
DROP TABLE IF EXISTS ccm_player_achievements CASCADE;
DROP TABLE IF EXISTS ccm_achievements CASCADE;
DROP TABLE IF EXISTS ccm_mvp_selections CASCADE;
DROP TABLE IF EXISTS ccm_round_plays CASCADE;
DROP TABLE IF EXISTS ccm_soft_skills_matrix CASCADE;
DROP TABLE IF EXISTS ccm_challenge_cards CASCADE;
DROP TABLE IF EXISTS ccm_synergy_cards CASCADE;
DROP TABLE IF EXISTS ccm_role_cards CASCADE;
DROP TABLE IF EXISTS ccm_session_participants CASCADE;
DROP TABLE IF EXISTS ccm_game_sessions CASCADE;
DROP TABLE IF EXISTS ccm_perpetual_rooms CASCADE;
```

**⚠️ Warning:** This will delete all CCM data!

**Note:** This rollback will NOT affect existing CC (Career Challenge) tables.

---

## Trade Secret Security 🔒

### `ccm_soft_skills_matrix` Table Protection

This table contains **proprietary algorithm data** (soft skills multipliers 0.95-1.15).

**Security Measures:**
1. ✅ Row Level Security (RLS) enabled
2. ✅ Policy blocks ALL direct access from frontend
3. ✅ Obfuscated column name (`m_val` instead of `soft_skills_multiplier`)
4. ✅ Only backend service role can query (bypasses RLS)
5. ✅ No logging of multiplier values in application code
6. ✅ Never exposed in API responses

**Testing RLS:**
```sql
-- Try to query as anon user (should return 0 rows)
SET ROLE anon;
SELECT * FROM ccm_soft_skills_matrix;
-- Result: 0 rows (blocked by RLS)

-- Backend service role can query (bypasses RLS)
SET ROLE service_role;
SELECT * FROM ccm_soft_skills_matrix;
-- Result: Full access to calculate scores
```

---

## Support

**Documentation:**
- Architecture overview: `/docs/DiscoveredLive/CCM_Architecture_Overview.md`
- Database schema details: See migration files
- Implementation roadmap: TBD

**Questions?**
- Check CCM architecture document
- Review migration comments
- Reference CC implementation for patterns

---

## Success Criteria

- [ ] All 11 tables created successfully
- [ ] RLS enabled on protected tables
- [ ] Featured rooms seeded
- [ ] No conflicts with existing CC tables
- [ ] All indexes created
- [ ] All foreign keys valid
- [ ] Check constraints working

---

**Ready to build the future of Career Challenge! 🚀**
