-- ================================================================
-- CHECK IF cb_clues HAS DATA
-- Fixed to use grade_category instead of grade_level
-- ================================================================

-- Count total clues
SELECT
  'Total clues in cb_clues:' as info,
  COUNT(*) as count
FROM cb_clues;

-- Count clues by grade category
SELECT
  'Clues by grade category:' as info,
  grade_category,
  COUNT(*) as count
FROM cb_clues
GROUP BY grade_category
ORDER BY grade_category;

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
WHERE grade_category = 'elementary'
LIMIT 5;
