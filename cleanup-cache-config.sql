-- Clean up cache warming configuration

-- 1. Remove duplicate Algebra 1 entry (keep the one with more question types)
DELETE FROM cache_warming_config
WHERE config_id = 'eea987ec-64a5-47f6-8037-ceec84f7d29e';

-- 2. Remove Pre-calculus (not appropriate for Grade 10)
DELETE FROM cache_warming_config
WHERE grade_level = '10' AND subject = 'Pre-calculus';

-- 3. Update the remaining Algebra 1 entry to have all 15 question types for proper cycling
UPDATE cache_warming_config
SET question_types = ARRAY[
    'multiple_choice',
    'true_false', 
    'fill_blank',
    'numeric',
    'matching',
    'ordering',
    'essay',
    'short_answer',
    'coding',
    'diagram_label',
    'graph_plot',
    'table_complete',
    'multi_select',
    'slider',
    'hotspot',
    'drag_drop',
    'word_problem'
]::text[]
WHERE grade_level = '10' AND subject = 'Algebra 1';

-- 4. Also update other subjects to have all question types for comprehensive testing
UPDATE cache_warming_config
SET question_types = ARRAY[
    'multiple_choice',
    'true_false', 
    'fill_blank',
    'numeric',
    'matching',
    'ordering',
    'essay',
    'short_answer',
    'coding',
    'diagram_label',
    'graph_plot',
    'table_complete',
    'multi_select',
    'slider',
    'hotspot',
    'drag_drop',
    'word_problem'
]::text[]
WHERE grade_level = '10';

-- 5. Show the cleaned up config
SELECT config_id, subject, array_length(question_types, 1) as num_question_types, question_types
FROM cache_warming_config 
WHERE grade_level = '10'
ORDER BY subject;

-- 6. Clear the queue to start fresh
DELETE FROM generation_queue;

-- 7. The system should now properly queue items with all 15 question types
SELECT 'Cache config cleaned up! The system will now queue all 15 question types for each subject.' as status;