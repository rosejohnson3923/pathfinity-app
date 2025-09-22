-- ============================================================
-- Final check and cleanup of YouTube optimization
-- ============================================================

-- Step 1: Check for any terms that might be too short or missing verbs
SELECT
    skill_name,
    youtube_search_terms,
    LENGTH(SPLIT_PART(youtube_search_terms, ' ', 1)) as first_word_length
FROM skills_master
WHERE LENGTH(SPLIT_PART(youtube_search_terms, ' ', 1)) < 4
   OR youtube_search_terms LIKE 'up to%'
   OR youtube_search_terms LIKE 'numbers up to%'
LIMIT 20;

-- Step 2: Fix the "Identify numbers" issue specifically
UPDATE skills_master
SET youtube_search_terms = REPLACE(youtube_search_terms, 'numbers up to', 'identify numbers up to')
WHERE skill_name LIKE 'Identify numbers%'
  AND youtube_search_terms LIKE 'numbers up to%';

-- Step 3: Final statistics
SELECT
    'Total Skills' as metric,
    COUNT(*) as count
FROM skills_master
UNION ALL
SELECT
    'Skills with Optimized YouTube Terms',
    COUNT(*)
FROM skills_master
WHERE youtube_search_terms IS NOT NULL
UNION ALL
SELECT
    'Skills with Descriptions',
    COUNT(*)
FROM skills_master
WHERE skill_description IS NOT NULL AND skill_description != ''
UNION ALL
SELECT
    'Skills Ready for Production',
    COUNT(*)
FROM skills_master
WHERE youtube_search_terms IS NOT NULL
  AND skill_description IS NOT NULL
  AND skill_description != '';

-- Step 4: Sample of optimized skills for each grade
SELECT
    grade,
    skill_name,
    youtube_search_terms
FROM skills_master
WHERE grade IN ('Pre-K', 'K', '1', '3', '7', '10')
ORDER BY
    CASE
        WHEN grade = 'Pre-K' THEN -1
        WHEN grade = 'K' THEN 0
        ELSE grade::INTEGER
    END,
    RANDOM()
LIMIT 12;