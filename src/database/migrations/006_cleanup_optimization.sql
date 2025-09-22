-- ============================================================
-- Cleanup YouTube Optimization - Remove trailing commas and improve terms
-- Date: 2025-01-22
-- ============================================================

-- Step 1: Clean up youtube_search_terms - remove any trailing commas
UPDATE skills_master
SET youtube_search_terms = REPLACE(youtube_search_terms, ', ', ' ')
WHERE youtube_search_terms LIKE '%,%';

-- Step 2: Clean up simplified_terms array - remove commas from individual terms
UPDATE skills_master
SET simplified_terms = ARRAY(
    SELECT TRIM(REPLACE(term, ',', ''))
    FROM unnest(simplified_terms) AS term
    WHERE TRIM(REPLACE(term, ',', '')) != ''
)
WHERE EXISTS (
    SELECT 1 FROM unnest(simplified_terms) AS term
    WHERE term LIKE '%,'
);

-- Step 3: Verify the cleanup
SELECT
    grade,
    subject,
    skill_name,
    youtube_search_terms,
    simplified_terms
FROM skills_master
WHERE skill_name LIKE '%possessive%'
   OR skill_name LIKE '%plural%'
ORDER BY
    CASE
        WHEN grade = 'Pre-K' THEN -1
        WHEN grade = 'K' THEN 0
        ELSE grade::INTEGER
    END, subject
LIMIT 20;

-- Step 4: Show summary of optimization quality
SELECT
    'Total Optimized' as metric,
    COUNT(*) as count
FROM skills_master
WHERE youtube_search_terms IS NOT NULL
UNION ALL
SELECT
    'Clean Search Terms (no commas)' as metric,
    COUNT(*) as count
FROM skills_master
WHERE youtube_search_terms IS NOT NULL
  AND youtube_search_terms NOT LIKE '%,%'
UNION ALL
SELECT
    'Terms Needing Cleanup' as metric,
    COUNT(*) as count
FROM skills_master
WHERE youtube_search_terms LIKE '%,%';