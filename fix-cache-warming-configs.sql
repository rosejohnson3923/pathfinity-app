-- Fix cache warming configs with null container_type

-- Delete configs with null container_type (they're duplicates)
DELETE FROM cache_warming_config 
WHERE container_type IS NULL;

-- Ensure all remaining configs have container_type set
UPDATE cache_warming_config 
SET container_type = 'learn' 
WHERE container_type IS NULL OR container_type = '';

-- Check the results
SELECT grade_level, subject, container_type, question_types 
FROM cache_warming_config 
WHERE grade_level = '10'
ORDER BY subject;