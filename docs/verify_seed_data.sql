-- ================================================================
-- VERIFICATION QUERIES FOR DISCOVERED LIVE SEED DATA
-- Run these in Supabase SQL Editor to verify the seed worked
-- ================================================================

-- 1. Check total number of clues inserted
-- Expected: 70 clues
SELECT COUNT(*) as total_clues FROM dl_clues;

-- 2. Check clues per career (should be 5 each for 14 careers)
-- Expected: 14 rows, each showing 5 clues
SELECT
  career_code,
  COUNT(*) as clue_count
FROM dl_clues
GROUP BY career_code
ORDER BY career_code;

-- 3. Check difficulty distribution
-- Expected: ~42 easy, ~28 medium
SELECT
  difficulty,
  COUNT(*) as count
FROM dl_clues
GROUP BY difficulty
ORDER BY difficulty;

-- 4. Check skill distribution
SELECT
  skill_connection,
  COUNT(*) as count
FROM dl_clues
GROUP BY skill_connection
ORDER BY count DESC;

-- 5. Verify all clues are active
SELECT
  is_active,
  COUNT(*) as count
FROM dl_clues
GROUP BY is_active;

-- 6. Check for any invalid career codes (should return 0 rows)
SELECT DISTINCT career_code
FROM dl_clues
WHERE career_code NOT IN (
  SELECT career_code
  FROM career_paths
  WHERE is_active = true
);

-- 7. Sample a few clues to verify data looks correct
SELECT
  career_code,
  clue_text,
  difficulty,
  skill_connection
FROM dl_clues
ORDER BY career_code, difficulty
LIMIT 10;

-- ================================================================
-- EXPECTED RESULTS SUMMARY
-- ================================================================
-- Total clues: 70
-- Careers: 14 (artist, chef, coach, doctor, engineer, farmer,
--              firefighter, librarian, musician, nurse,
--              police-officer, scientist, teacher, veterinarian)
-- Each career: 5 clues
-- All clues: is_active = true
-- No invalid career codes
-- ================================================================
