-- Check what constraints exist on skills_master
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'skills_master'::regclass
AND contype = 'c';  -- Check constraints

-- See what subjects are currently in skills_master
SELECT DISTINCT subject 
FROM skills_master 
ORDER BY subject;

-- See what subjects are in skills_master_v2
SELECT DISTINCT subject 
FROM skills_master_v2 
ORDER BY subject;