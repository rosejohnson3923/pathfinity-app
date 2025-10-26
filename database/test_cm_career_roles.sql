-- Test query to verify cm_career_roles table has data
SELECT
  career_name,
  is_active,
  created_at
FROM cm_career_roles
WHERE is_active = true
ORDER BY career_name
LIMIT 10;

-- If this returns 0 rows, the table is empty
-- If this returns rows, then the function needs to be updated with correct column name
