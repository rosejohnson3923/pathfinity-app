-- ============================================================
-- Test Script: Verify YouTube Optimization
-- Run this AFTER running 001_add_youtube_optimization.sql
-- ============================================================

-- Test 1: Check that columns were added
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'skills_master'
  AND column_name IN ('youtube_search_terms', 'simplified_terms', 'search_variants');

-- Test 2: Show optimization examples for each grade
SELECT
    '------- KINDERGARTEN EXAMPLES -------' as section;

SELECT
    skill_name,
    youtube_search_terms,
    simplified_terms
FROM skills_master
WHERE grade = 'K'
LIMIT 3;

SELECT
    '------- GRADE 1 EXAMPLES -------' as section;

SELECT
    skill_name,
    youtube_search_terms,
    simplified_terms
FROM skills_master
WHERE grade = '1'
LIMIT 3;

SELECT
    '------- GRADE 7 EXAMPLES -------' as section;

SELECT
    skill_name,
    youtube_search_terms,
    simplified_terms
FROM skills_master
WHERE grade = '7'
LIMIT 3;

SELECT
    '------- GRADE 10 EXAMPLES -------' as section;

SELECT
    skill_name,
    youtube_search_terms,
    simplified_terms
FROM skills_master
WHERE grade = '10'
LIMIT 3;

-- Test 3: Specific test for Taylor's skill
SELECT
    '------- TAYLOR''S SKILL OPTIMIZATION -------' as section;

SELECT
    skill_name,
    youtube_search_terms,
    simplified_terms,
    search_variants
FROM skills_master
WHERE skill_name = 'Determine the main idea of a passage'
  AND grade = '10';

-- Test 4: Show statistics
SELECT
    '------- OPTIMIZATION STATISTICS -------' as section;

SELECT
    grade,
    subject,
    COUNT(*) as total_skills,
    COUNT(youtube_search_terms) as optimized,
    COUNT(*) - COUNT(youtube_search_terms) as not_optimized
FROM skills_master
WHERE grade IN ('K', '1', '7', '10')
GROUP BY grade, subject
ORDER BY grade, subject;

-- Test 5: Find any skills that might have issues
SELECT
    '------- POTENTIAL ISSUES -------' as section;

SELECT
    id,
    skill_name,
    grade,
    subject,
    'No YouTube search terms' as issue
FROM skills_master
WHERE grade IN ('K', '1', '7', '10')
  AND youtube_search_terms IS NULL
LIMIT 10;

-- Test 6: Test the functions directly
SELECT
    '------- FUNCTION TEST -------' as section;

-- Test with Taylor's example
SELECT
    generate_youtube_search_term(
        'Determine the main idea of a passage',
        'ELA',
        '10'
    ) as optimized_search,
    extract_skill_key_terms(
        'Determine the main idea of a passage'
    ) as key_terms,
    generate_search_variants(
        'Determine the main idea of a passage',
        'ELA',
        '10'
    ) as search_variants;