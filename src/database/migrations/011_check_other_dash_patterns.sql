-- ============================================================
-- Check the 193 "Other Dash Pattern" skills
-- These might be the actual problematic ones
-- ============================================================

-- Step 1: Show examples of "Other Dash Pattern" skills
SELECT
    grade,
    subject,
    skill_name,
    skills_area,
    youtube_search_terms,
    SPLIT_PART(skill_name, ' - ', 1) as before_dash,
    SPLIT_PART(skill_name, ' - ', 2) as after_dash
FROM skills_master
WHERE skill_name LIKE '% - %'
  AND skill_name NOT LIKE '% - up to %'
  AND skill_name NOT LIKE '% - to %'
ORDER BY grade, subject
LIMIT 30;

-- Step 2: Group the "after dash" content to see patterns
SELECT
    SPLIT_PART(skill_name, ' - ', 2) as after_dash_content,
    COUNT(*) as count
FROM skills_master
WHERE skill_name LIKE '% - %'
  AND skill_name NOT LIKE '% - up to %'
  AND skill_name NOT LIKE '% - to %'
GROUP BY SPLIT_PART(skill_name, ' - ', 2)
ORDER BY count DESC
LIMIT 20;

-- Step 3: Check if these are getting poor YouTube optimization
SELECT
    skill_name,
    youtube_search_terms,
    simplified_terms
FROM skills_master
WHERE skill_name LIKE '% - %'
  AND skill_name NOT LIKE '% - up to %'
  AND skill_name NOT LIKE '% - to %'
  AND (
    youtube_search_terms LIKE '%-%' OR
    youtube_search_terms LIKE '% - %'
  )
LIMIT 10;