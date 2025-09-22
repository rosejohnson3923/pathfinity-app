-- ============================================================
-- Script: Optimize New Grade Levels
-- Run this when you add grades 2, 3, 4, 5, 6, 8, 9, 11, 12
-- ============================================================

-- INSTRUCTIONS:
-- Replace 'X' with the grade number you just added
-- For example, if you just added grade 2 data, replace 'X' with '2'

-- Option 1: Optimize a single grade
UPDATE skills_master
SET
    youtube_search_terms = generate_youtube_search_term(skill_name, subject, grade),
    simplified_terms = extract_skill_key_terms(skill_name),
    search_variants = generate_search_variants(skill_name, subject, grade)
WHERE grade = 'X'  -- <-- Replace X with your grade number
  AND youtube_search_terms IS NULL;

-- Show what was updated
SELECT
    grade,
    subject,
    COUNT(*) as skills_optimized
FROM skills_master
WHERE grade = 'X'  -- <-- Replace X with your grade number
  AND youtube_search_terms IS NOT NULL
GROUP BY grade, subject;

-- Option 2: Optimize multiple grades at once
-- Uncomment and modify the line below:
/*
UPDATE skills_master
SET
    youtube_search_terms = generate_youtube_search_term(skill_name, subject, grade),
    simplified_terms = extract_skill_key_terms(skill_name),
    search_variants = generate_search_variants(skill_name, subject, grade)
WHERE grade IN ('2', '3', '4', '5', '6')  -- <-- Add your grade numbers here
  AND youtube_search_terms IS NULL;
*/

-- Option 3: Optimize ALL unoptimized skills (use with caution)
/*
UPDATE skills_master
SET
    youtube_search_terms = generate_youtube_search_term(skill_name, subject, grade),
    simplified_terms = extract_skill_key_terms(skill_name),
    search_variants = generate_search_variants(skill_name, subject, grade)
WHERE youtube_search_terms IS NULL;
*/

-- Verify optimization for new grades
SELECT
    grade,
    subject,
    COUNT(*) as total_skills,
    COUNT(youtube_search_terms) as optimized_skills,
    COUNT(*) FILTER (WHERE youtube_search_terms IS NULL) as not_optimized
FROM skills_master
GROUP BY grade, subject
ORDER BY grade::INTEGER, subject;