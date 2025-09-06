-- Check current grades in database including grade 10
SELECT 
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