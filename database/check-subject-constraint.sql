-- Get the exact constraint definition for subject
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'skills_master'::regclass
AND conname LIKE '%subject%';

-- See what subjects currently exist in skills_master
SELECT DISTINCT subject, COUNT(*) as count
FROM skills_master 
GROUP BY subject
ORDER BY subject;

-- See what subjects need to be migrated from skills_master_v2
SELECT DISTINCT subject, COUNT(*) as count
FROM skills_master_v2 
WHERE subject != 'Precalculus'  -- We're skipping this
GROUP BY subject
ORDER BY subject;