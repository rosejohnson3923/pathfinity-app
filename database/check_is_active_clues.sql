-- ================================================================
-- CHECK is_active STATUS OF CLUES
-- ================================================================

-- Count clues by is_active status
SELECT
  'Clues by is_active status:' as info,
  is_active,
  COUNT(*) as count
FROM cb_clues
GROUP BY is_active;

-- Count ACTIVE elementary clues
SELECT
  'Active elementary clues:' as info,
  COUNT(*) as count
FROM cb_clues
WHERE grade_category = 'elementary'
  AND is_active = true;

-- Count ALL elementary clues (including inactive)
SELECT
  'ALL elementary clues:' as info,
  COUNT(*) as count
FROM cb_clues
WHERE grade_category = 'elementary';

-- Sample inactive elementary clues
SELECT
  'Sample INACTIVE elementary clues:' as info,
  career_code,
  is_active,
  COUNT(*) as count
FROM cb_clues
WHERE grade_category = 'elementary'
  AND is_active = false
GROUP BY career_code, is_active
LIMIT 10;
