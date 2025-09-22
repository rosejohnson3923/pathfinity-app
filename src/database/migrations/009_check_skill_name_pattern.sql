-- ============================================================
-- Check skill_name pattern - appears to have appended skill areas
-- Example: "Identify adjectives - ELA Grammar"
-- ============================================================

-- Step 1: Check how many skill_names have this pattern (contain " - ")
SELECT
    COUNT(*) as total_skills,
    COUNT(CASE WHEN skill_name LIKE '% - %' THEN 1 END) as has_dash_pattern,
    ROUND(COUNT(CASE WHEN skill_name LIKE '% - %' THEN 1 END)::numeric / COUNT(*)::numeric * 100, 2) as percent_with_pattern
FROM skills_master;

-- Step 2: Show examples of this pattern by grade
SELECT
    grade,
    subject,
    skill_name,
    skills_area,
    youtube_search_terms
FROM skills_master
WHERE skill_name LIKE '% - %'
ORDER BY grade, subject
LIMIT 20;

-- Step 3: Extract the parts to understand the pattern
SELECT DISTINCT
    SPLIT_PART(skill_name, ' - ', 2) as appended_part,
    skills_area,
    COUNT(*) as count
FROM skills_master
WHERE skill_name LIKE '% - %'
GROUP BY SPLIT_PART(skill_name, ' - ', 2), skills_area
ORDER BY count DESC
LIMIT 20;

-- Step 4: Check if the appended part matches skills_area
SELECT
    grade,
    subject,
    skill_name,
    skills_area,
    SPLIT_PART(skill_name, ' - ', 1) as actual_skill,
    SPLIT_PART(skill_name, ' - ', 2) as appended_area,
    CASE
        WHEN SPLIT_PART(skill_name, ' - ', 2) = skills_area THEN 'MATCHES'
        ELSE 'DIFFERENT'
    END as area_match
FROM skills_master
WHERE skill_name LIKE '% - %'
LIMIT 30;