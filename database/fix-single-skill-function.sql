-- Drop the existing function completely
DROP FUNCTION IF EXISTS populate_taylor_single_skill_test();

-- Recreate with proper type casting
CREATE FUNCTION populate_taylor_single_skill_test()
RETURNS TABLE (
    subject VARCHAR,
    skill_used VARCHAR,
    container VARCHAR,
    question_types_queued INTEGER
) AS $$
DECLARE
    v_subject_record RECORD;
    v_container VARCHAR;
    v_question_type VARCHAR;
    v_count INTEGER;
    v_containers TEXT[] := ARRAY['learn', 'experience', 'discover'];
    v_question_types TEXT[] := ARRAY[
        'multiple_choice', 'true_false', 'fill_blank', 'numeric', 'matching',
        'ordering', 'short_answer', 'essay', 'drag_drop', 'multi_select',
        'slider', 'hotspot', 'diagram_label', 'graph_plot', 'table_complete'
    ];
BEGIN
    -- Clear existing queue for Taylor
    DELETE FROM generation_queue gq
    WHERE gq.student_id = 'Taylor' AND gq.grade_level = '10';
    
    -- For each subject, get the FIRST skill (typically A.0 or A.1)
    FOR v_subject_record IN 
        SELECT DISTINCT 
            sm.subject::TEXT as subject,
            (SELECT sm2.id FROM skills_master sm2 
             WHERE sm2.subject = sm.subject 
             AND sm2.grade_level = '10'
             ORDER BY sm2.skill_number 
             LIMIT 1) as first_skill_id,
            (SELECT sm2.skill_number::TEXT FROM skills_master sm2 
             WHERE sm2.subject = sm.subject 
             AND sm2.grade_level = '10'
             ORDER BY sm2.skill_number 
             LIMIT 1) as first_skill_number,
            (SELECT sm2.skill_name::TEXT FROM skills_master sm2 
             WHERE sm2.subject = sm.subject 
             AND sm2.grade_level = '10'
             ORDER BY sm2.skill_number 
             LIMIT 1) as first_skill_name
        FROM skills_master sm
        WHERE sm.grade_level = '10'
        ORDER BY sm.subject
    LOOP
        -- For each container type
        FOREACH v_container IN ARRAY v_containers
        LOOP
            v_count := 0;
            
            -- For each question type
            FOREACH v_question_type IN ARRAY v_question_types
            LOOP
                -- Add single skill to queue for this combination
                INSERT INTO generation_queue (
                    student_id, 
                    grade_level, 
                    subject, 
                    skill_id,
                    container_type, 
                    question_type, 
                    priority, 
                    status
                ) VALUES (
                    'Taylor',                               -- student_id
                    '10',                                   -- grade_level
                    v_subject_record.subject,              -- subject
                    v_subject_record.first_skill_id::text, -- skill_id (same skill for all)
                    v_container,                            -- container_type
                    v_question_type,                       -- question_type
                    100,                                    -- priority
                    'pending'                               -- status
                );
                
                v_count := v_count + 1;
            END LOOP;
            
            -- Return progress for this subject/container
            RETURN QUERY 
            SELECT 
                v_subject_record.subject::VARCHAR,
                CONCAT(v_subject_record.first_skill_number, ': ', v_subject_record.first_skill_name)::VARCHAR AS skill_used,
                v_container::VARCHAR,
                v_count::INTEGER;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Now execute the function
SELECT * FROM populate_taylor_single_skill_test()
ORDER BY subject, container;

-- Verify what we created
SELECT 
    'Summary' as report,
    COUNT(*) as total_items,
    COUNT(DISTINCT subject) as subjects,
    COUNT(DISTINCT container_type) as containers,
    COUNT(DISTINCT question_type) as question_types,
    COUNT(DISTINCT skill_id) as unique_skills
FROM generation_queue
WHERE student_id = 'Taylor' AND grade_level = '10' AND status = 'pending';

-- Show the single skill being used per subject across all containers and question types
SELECT 
    subject,
    container_type,
    COUNT(DISTINCT question_type) as question_types,
    COUNT(*) as total_items,
    MIN(skill_id) as skill_id_used
FROM generation_queue
WHERE student_id = 'Taylor' AND grade_level = '10'
GROUP BY subject, container_type
ORDER BY subject, container_type;