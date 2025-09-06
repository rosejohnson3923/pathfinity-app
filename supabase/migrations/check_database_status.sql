-- ================================================================
-- SKILLS DATABASE STATUS CHECK
-- Run this in Supabase Dashboard > SQL Editor
-- ================================================================

-- Total count
SELECT 'TOTAL SKILLS' as metric, COUNT(*) as count FROM skills_master;

-- Skills by Grade
SELECT 
    'SKILLS BY GRADE' as section,
    grade,
    COUNT(*) as skill_count
FROM skills_master 
GROUP BY grade 
ORDER BY 
    CASE grade
        WHEN 'Pre-K' THEN 1
        WHEN 'K' THEN 2
        WHEN '1' THEN 3
        WHEN '3' THEN 4
        WHEN '7' THEN 5
        WHEN '10' THEN 6
        WHEN 'Algebra1' THEN 7
        WHEN 'Precalculus' THEN 8
        ELSE 9
    END;

-- Skills by Subject
SELECT 
    'SKILLS BY SUBJECT' as section,
    subject,
    COUNT(*) as skill_count
FROM skills_master 
GROUP BY subject 
ORDER BY subject;

-- Skills by Grade and Subject
SELECT 
    'SKILLS BY GRADE-SUBJECT' as section,
    grade,
    subject,
    COUNT(*) as skill_count
FROM skills_master 
GROUP BY grade, subject 
ORDER BY 
    CASE grade
        WHEN 'Pre-K' THEN 1
        WHEN 'K' THEN 2
        WHEN '1' THEN 3
        WHEN '3' THEN 4
        WHEN '7' THEN 5
        WHEN '10' THEN 6
        WHEN 'Algebra1' THEN 7
        WHEN 'Precalculus' THEN 8
        ELSE 9
    END,
    subject;

-- Sample records from each grade
SELECT 
    'SAMPLE RECORDS' as section,
    grade,
    subject,
    skill_name,
    skills_area,
    difficulty_level,
    estimated_time_minutes
FROM (
    SELECT *,
           ROW_NUMBER() OVER (PARTITION BY grade, subject ORDER BY skill_name) as rn
    FROM skills_master
) ranked
WHERE rn <= 2
ORDER BY 
    CASE grade
        WHEN 'Pre-K' THEN 1
        WHEN 'K' THEN 2
        WHEN '1' THEN 3
        WHEN '3' THEN 4
        WHEN '7' THEN 5
        WHEN '10' THEN 6
        WHEN 'Algebra1' THEN 7
        WHEN 'Precalculus' THEN 8
        ELSE 9
    END,
    subject,
    skill_name;

-- Check constraint status
SELECT 
    'CONSTRAINT CHECK' as section,
    cc.constraint_name,
    cc.check_clause
FROM information_schema.check_constraints cc
JOIN information_schema.table_constraints tc 
    ON cc.constraint_name = tc.constraint_name
WHERE tc.table_name = 'skills_master' 
AND cc.constraint_name = 'skills_master_grade_check';