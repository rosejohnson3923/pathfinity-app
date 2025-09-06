-- ================================================================
-- UPDATE CONTENT GENERATION QUEUE TO USE skills_master
-- ================================================================
-- This script updates the Content Generation system to use 
-- skills_master instead of skills_master_v2
-- ================================================================

-- SECTION 1: Clear existing queue for fresh start
-- ================================================================
DELETE FROM generation_queue 
WHERE student_id = 'Taylor' AND grade_level = '10';

SELECT 'Queue cleared for Taylor' as status;

-- SECTION 2: Update cache warming config
-- ================================================================
-- Update to ensure it references the correct table (though table name is in code)
UPDATE cache_warming_config
SET 
    updated_at = NOW(),
    skills_count = 10  -- Increase skills count for better testing coverage
WHERE grade_level = '10';

-- Show current config
SELECT 
    grade_level,
    subject,
    container_type,
    array_length(question_types, 1) as num_question_types,
    skills_count,
    is_active
FROM cache_warming_config
WHERE grade_level = '10'
ORDER BY subject;

-- SECTION 3: Populate test queue with all 15 question types
-- ================================================================

-- Create function to populate queue with all question types for Taylor
CREATE OR REPLACE FUNCTION populate_taylor_test_queue()
RETURNS TABLE (
    subject VARCHAR,
    question_type VARCHAR,
    skills_queued INTEGER
) AS $$
DECLARE
    v_subject VARCHAR;
    v_question_type VARCHAR;
    v_skill RECORD;
    v_count INTEGER;
    v_question_types TEXT[] := ARRAY[
        'multiple_choice', 'true_false', 'fill_blank', 'numeric', 'matching',
        'ordering', 'short_answer', 'essay', 'drag_drop', 'multi_select',
        'slider', 'hotspot', 'diagram_label', 'graph_plot', 'table_complete'
    ];
BEGIN
    -- Clear existing queue for Taylor
    DELETE FROM generation_queue 
    WHERE student_id = 'Taylor' AND grade_level = '10';
    
    -- For each subject available for Grade 10
    FOR v_subject IN 
        SELECT DISTINCT s.subject 
        FROM skills_master s
        WHERE s.grade_level = '10'
        ORDER BY s.subject
    LOOP
        -- For each question type
        FOREACH v_question_type IN ARRAY v_question_types
        LOOP
            v_count := 0;
            
            -- Queue up to 2 skills per subject/question type combination for manageable testing
            FOR v_skill IN 
                SELECT sm.id as skill_id, sm.skill_name, sm.skill_number
                FROM skills_master sm
                WHERE sm.grade_level = '10' 
                AND sm.subject = v_subject
                ORDER BY sm.skill_number
                LIMIT 2
            LOOP
                -- Add to queue
                INSERT INTO generation_queue (
                    student_id, grade_level, subject, skill_id,
                    container_type, question_type, priority, status
                ) VALUES (
                    'Taylor',              -- student_id
                    '10',                  -- grade_level
                    v_subject,             -- subject
                    v_skill.skill_id::text,-- skill_id
                    'learn',               -- container_type
                    v_question_type,       -- question_type
                    100 - v_count,         -- priority (higher for first skills)
                    'pending'              -- status
                );
                
                v_count := v_count + 1;
            END LOOP;
            
            -- Return progress
            RETURN QUERY SELECT v_subject, v_question_type, v_count;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- SECTION 4: Execute population
-- ================================================================

-- Populate the queue
SELECT * FROM populate_taylor_test_queue()
ORDER BY subject, 
    CASE question_type
        WHEN 'multiple_choice' THEN 1
        WHEN 'true_false' THEN 2
        WHEN 'fill_blank' THEN 3
        WHEN 'numeric' THEN 4
        WHEN 'matching' THEN 5
        WHEN 'ordering' THEN 6
        WHEN 'short_answer' THEN 7
        WHEN 'essay' THEN 8
        WHEN 'drag_drop' THEN 9
        WHEN 'multi_select' THEN 10
        WHEN 'slider' THEN 11
        WHEN 'hotspot' THEN 12
        WHEN 'diagram_label' THEN 13
        WHEN 'graph_plot' THEN 14
        WHEN 'table_complete' THEN 15
    END;

-- SECTION 5: Verify queue status
-- ================================================================

-- Summary by subject
SELECT 
    subject,
    COUNT(DISTINCT question_type) as question_types,
    COUNT(*) as total_items,
    MIN(priority) as min_priority,
    MAX(priority) as max_priority
FROM generation_queue
WHERE student_id = 'Taylor' AND grade_level = '10'
GROUP BY subject
ORDER BY subject;

-- Overall summary
SELECT 
    'Queue populated!' as status,
    COUNT(*) as total_items,
    COUNT(DISTINCT subject) as subjects,
    COUNT(DISTINCT question_type) as question_types,
    COUNT(DISTINCT skill_id) as unique_skills
FROM generation_queue
WHERE student_id = 'Taylor' AND grade_level = '10' AND status = 'pending';

-- SECTION 6: Create processing helper
-- ================================================================

-- Function to process a batch of queue items (for testing)
CREATE OR REPLACE FUNCTION process_taylor_queue_batch(batch_size INTEGER DEFAULT 5)
RETURNS TABLE (
    processed_count INTEGER,
    remaining_count INTEGER,
    subjects_covered TEXT
) AS $$
DECLARE
    v_processed INTEGER := 0;
    v_worker_id UUID;
BEGIN
    -- Get or create worker
    SELECT worker_id INTO v_worker_id
    FROM generation_workers
    WHERE worker_name = 'test_worker'
    LIMIT 1;
    
    IF v_worker_id IS NULL THEN
        INSERT INTO generation_workers (worker_name, status)
        VALUES ('test_worker', 'idle')
        RETURNING worker_id INTO v_worker_id;
    END IF;
    
    -- Process batch
    UPDATE generation_queue
    SET 
        status = 'processing',
        worker_id = v_worker_id,
        processed_at = NOW()
    WHERE queue_id IN (
        SELECT queue_id 
        FROM generation_queue
        WHERE status = 'pending'
        AND student_id = 'Taylor'
        ORDER BY priority DESC
        LIMIT batch_size
    );
    
    GET DIAGNOSTICS v_processed = ROW_COUNT;
    
    -- Return results
    RETURN QUERY
    SELECT 
        v_processed,
        COUNT(*)::INTEGER,
        STRING_AGG(DISTINCT subject, ', ')
    FROM generation_queue
    WHERE status = 'pending'
    AND student_id = 'Taylor';
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- TESTING INSTRUCTIONS
-- ================================================================
/*
To test all 15 question types:

1. Run this entire script to set up the queue

2. Check queue status:
   SELECT subject, question_type, COUNT(*)
   FROM generation_queue
   WHERE student_id = 'Taylor' AND status = 'pending'
   GROUP BY subject, question_type
   ORDER BY subject, question_type;

3. Process items (simulated):
   SELECT * FROM process_taylor_queue_batch(10);

4. Monitor progress:
   SELECT 
       question_type,
       COUNT(*) FILTER (WHERE status = 'pending') as pending,
       COUNT(*) FILTER (WHERE status = 'processing') as processing,
       COUNT(*) FILTER (WHERE status = 'completed') as completed,
       COUNT(*) FILTER (WHERE status = 'failed') as failed
   FROM generation_queue
   WHERE student_id = 'Taylor'
   GROUP BY question_type
   ORDER BY question_type;

5. Reset if needed:
   DELETE FROM generation_queue WHERE student_id = 'Taylor';
   SELECT * FROM populate_taylor_test_queue();
*/