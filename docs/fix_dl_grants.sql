-- ================================================================
-- Fix Discovered Live! table grants - Remove excessive permissions
-- Run this in Supabase SQL Editor to secure the tables properly
-- ================================================================

-- STEP 1: Revoke ALL privileges from authenticated role
REVOKE ALL PRIVILEGES ON dl_clues FROM authenticated;
REVOKE ALL PRIVILEGES ON dl_games FROM authenticated;
REVOKE ALL PRIVILEGES ON dl_answers FROM authenticated;

-- STEP 2: Grant only the necessary privileges

-- dl_clues: READ ONLY (students should NOT modify clues)
GRANT SELECT ON dl_clues TO authenticated;

-- dl_games: SELECT, INSERT, UPDATE (students can create and update their own games)
GRANT SELECT, INSERT, UPDATE ON dl_games TO authenticated;

-- dl_answers: SELECT, INSERT (students can view and submit answers, but not modify them)
GRANT SELECT, INSERT ON dl_answers TO authenticated;

-- ================================================================
-- VERIFICATION QUERY
-- ================================================================
-- After running, verify the grants are correct:
SELECT
  grantee,
  table_name,
  privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
  AND table_name LIKE 'dl_%'
  AND grantee = 'authenticated'
ORDER BY table_name, privilege_type;

-- Expected output (ONLY these 6 rows):
-- grantee        | table_name | privilege_type
-- ---------------+------------+---------------
-- authenticated  | dl_answers | INSERT
-- authenticated  | dl_answers | SELECT
-- authenticated  | dl_clues   | SELECT
-- authenticated  | dl_games   | INSERT
-- authenticated  | dl_games   | SELECT
-- authenticated  | dl_games   | UPDATE

-- ================================================================
-- SECURITY NOTES
-- ================================================================
-- ✅ dl_clues: SELECT only (read-only, managed by admins/AI)
-- ✅ dl_games: SELECT, INSERT, UPDATE (students create and update their games)
-- ✅ dl_answers: SELECT, INSERT (students submit answers, cannot modify after)
-- ❌ No DELETE (prevents data loss)
-- ❌ No TRUNCATE (prevents table clearing)
-- ❌ No REFERENCES (prevents foreign key creation)
-- ❌ No TRIGGER (prevents trigger creation)
