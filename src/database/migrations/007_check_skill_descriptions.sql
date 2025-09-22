-- ============================================================
-- Check and potentially fix blank skill_description fields
-- Date: 2025-01-22
-- ============================================================

-- Step 1: Check how many skills have blank or NULL descriptions
SELECT
    grade,
    subject,
    COUNT(*) as total_skills,
    COUNT(skill_description) as has_description,
    COUNT(*) - COUNT(skill_description) as missing_description,
    ROUND((COUNT(*) - COUNT(skill_description))::numeric / COUNT(*)::numeric * 100, 2) as percent_missing
FROM skills_master
GROUP BY grade, subject
ORDER BY
    CASE
        WHEN grade = 'Pre-K' THEN -1
        WHEN grade = 'K' THEN 0
        ELSE grade::INTEGER
    END, subject;

-- Step 2: Show examples of records with missing descriptions
SELECT
    grade,
    subject,
    skill_number,
    skill_name,
    skill_description
FROM skills_master
WHERE skill_description IS NULL
   OR skill_description = ''
LIMIT 20;

-- Step 3: Count total missing
SELECT
    COUNT(*) as total_with_missing_description
FROM skills_master
WHERE skill_description IS NULL
   OR skill_description = '';

-- Step 4: If needed, we can populate skill_description with skill_name as fallback
-- UNCOMMENT TO RUN:
/*
UPDATE skills_master
SET skill_description = skill_name
WHERE skill_description IS NULL
   OR skill_description = '';
*/