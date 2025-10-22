-- ================================================================
-- CHECK IF cb_clues HAS DATA
-- ================================================================

-- Count total clues
SELECT
  'Total clues in cb_clues:' as info,
  COUNT(*) as count
FROM cb_clues;

-- Count clues by grade level
SELECT
  'Clues by grade level:' as info,
  grade_level,
  COUNT(*) as count
FROM cb_clues
GROUP BY grade_level
ORDER BY grade_level;

-- Count clues by career
SELECT
  'Clues by career (top 10):' as info,
  career_code,
  COUNT(*) as count
FROM cb_clues
GROUP BY career_code
ORDER BY COUNT(*) DESC
LIMIT 10;

-- Sample clues for elementary grade
SELECT
  'Sample elementary clues:' as info,
  id,
  career_code,
  clue_text,
  difficulty
FROM cb_clues
WHERE grade_level = 'elementary'
LIMIT 5;
