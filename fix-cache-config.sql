-- Fix cache warming configuration for Grade 10

-- 1. Show current cache warming config
SELECT * FROM cache_warming_config WHERE grade_level = '10';

-- 2. Check what subjects exist in skills_master_v2 for Grade 10
SELECT DISTINCT subject 
FROM skills_master_v2 
WHERE grade_level = '10'
ORDER BY subject;

-- 3. Check what constraints exist on cache_warming_config
SELECT conname, contype, conkey
FROM pg_constraint
WHERE conrelid = 'cache_warming_config'::regclass;

-- 4. Delete the incorrect Math entry for Grade 10
DELETE FROM cache_warming_config
WHERE grade_level = '10' AND subject = 'Math';

-- 5. Insert Algebra 1 config (without ON CONFLICT since there's no unique constraint)
-- First check if it already exists
SELECT * FROM cache_warming_config 
WHERE grade_level = '10' AND subject = 'Algebra 1';

-- If the above returns nothing, run this:
INSERT INTO cache_warming_config (grade_level, subject, container_type, question_types, skills_count)
VALUES ('10', 'Algebra 1', 'learn', ARRAY['multiple_choice', 'numeric', 'word_problem', 'true_false', 'fill_blank'], 5);

-- 6. Show updated config
SELECT * FROM cache_warming_config WHERE grade_level = '10';

-- 7. Now the PreGenerationService should be able to add Algebra 1 items properly
-- Clear any existing queue items and let it start fresh
DELETE FROM generation_queue WHERE grade_level = '10';

-- 8. Show what's in the queue now
SELECT subject, COUNT(*) as count
FROM generation_queue
WHERE status = 'pending'
GROUP BY subject
ORDER BY subject;