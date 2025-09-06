-- Check cache warming configuration for Grade 10

-- 1. Show current cache warming config
SELECT * FROM cache_warming_config WHERE grade_level = '10';

-- 2. Check what subjects exist in skills_master_v2 for Grade 10
SELECT DISTINCT subject 
FROM skills_master_v2 
WHERE grade_level = '10'
ORDER BY subject;

-- 3. Fix the cache warming config - Grade 10 uses "Algebra 1" not "Math"
UPDATE cache_warming_config
SET subject = 'Algebra 1'
WHERE grade_level = '10' AND subject = 'Math';

-- 4. If no Algebra 1 config exists, insert it
INSERT INTO cache_warming_config (grade_level, subject, container_type, question_types, skills_count)
VALUES ('10', 'Algebra 1', 'learn', ARRAY['multiple_choice', 'numeric', 'word_problem'], 5)
ON CONFLICT (grade_level, subject, container_type) DO NOTHING;

-- 5. Show updated config
SELECT * FROM cache_warming_config WHERE grade_level = '10';

-- 6. Now check the queue - it should have Algebra 1 items
SELECT subject, COUNT(*) as count
FROM generation_queue
WHERE status = 'pending'
GROUP BY subject;