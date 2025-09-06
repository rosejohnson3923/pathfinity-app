-- Check what subjects are currently in the database
SELECT 
    'CURRENT SUBJECTS' as section,
    subject,
    COUNT(*) as skill_count
FROM skills_master 
GROUP BY subject 
ORDER BY subject;

-- Also check for any unusual or unexpected subject values
SELECT 
    'UNIQUE SUBJECTS' as section,
    DISTINCT subject
FROM skills_master 
ORDER BY subject;