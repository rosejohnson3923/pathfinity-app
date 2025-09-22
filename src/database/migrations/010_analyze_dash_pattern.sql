-- ============================================================
-- Analyze dash pattern in skill names
-- These appear to be range indicators, not appended categories
-- ============================================================

-- Step 1: Count skills with dash pattern
SELECT
    COUNT(*) as total_with_dash
FROM skills_master
WHERE skill_name LIKE '% - %';

-- Step 2: Group by what comes after the dash
SELECT
    SPLIT_PART(skill_name, ' - ', 2) as after_dash,
    COUNT(*) as count
FROM skills_master
WHERE skill_name LIKE '% - %'
GROUP BY SPLIT_PART(skill_name, ' - ', 2)
ORDER BY count DESC
LIMIT 20;

-- Step 3: Check how these are being optimized for YouTube
SELECT
    skill_name,
    youtube_search_terms,
    simplified_terms
FROM skills_master
WHERE skill_name LIKE '% - up to %'
LIMIT 10;

-- Step 4: Check other non-range dash patterns
SELECT
    grade,
    subject,
    skill_name,
    youtube_search_terms
FROM skills_master
WHERE skill_name LIKE '% - %'
  AND skill_name NOT LIKE '% - up to %'
  AND skill_name NOT LIKE '% - to %'
LIMIT 20;

-- Step 5: Summary of dash patterns
SELECT
    CASE
        WHEN skill_name LIKE '% - up to %' THEN 'Number Range (up to X)'
        WHEN skill_name LIKE '% - to %' THEN 'Number Range (X to Y)'
        WHEN skill_name LIKE '% - %' THEN 'Other Dash Pattern'
        ELSE 'No Dash'
    END as pattern_type,
    COUNT(*) as count,
    ROUND(COUNT(*)::numeric / (SELECT COUNT(*) FROM skills_master)::numeric * 100, 2) as percent
FROM skills_master
GROUP BY pattern_type
ORDER BY count DESC;