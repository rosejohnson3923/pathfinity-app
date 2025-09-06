-- Drop the existing function first to ensure clean replacement
DROP FUNCTION IF EXISTS populate_taylor_test_queue();

-- Create the corrected function with table aliases
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
    DELETE FROM generation_queue gq
    WHERE gq.student_id = 'Taylor' AND gq.grade_level = '10';
    
    -- For each subject available for Grade 10
    FOR v_subject IN 
        SELECT DISTINCT sm.subject 
        FROM skills_master sm
        WHERE sm.grade_level = '10'
        ORDER BY sm.subject
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

-- Now execute the function to populate the queue
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

-- Verify the queue was populated
SELECT 
    'Queue populated!' as status,
    COUNT(*) as total_items,
    COUNT(DISTINCT subject) as subjects,
    COUNT(DISTINCT question_type) as question_types
FROM generation_queue
WHERE student_id = 'Taylor' AND grade_level = '10' AND status = 'pending';