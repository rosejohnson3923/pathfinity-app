-- ================================================================
-- QUESTION TYPE TESTING TRACKER SYSTEM
-- ================================================================
-- This creates tables and views to track testing progress
-- for all 15 question types across subjects and containers
-- ================================================================

-- SECTION 1: Create Testing Progress Table
-- ================================================================

-- Drop if exists for clean setup
DROP TABLE IF EXISTS question_type_testing CASCADE;

CREATE TABLE question_type_testing (
    test_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    queue_id UUID REFERENCES generation_queue(queue_id),
    student_id VARCHAR(255) NOT NULL DEFAULT 'Taylor',
    grade_level VARCHAR(10) NOT NULL DEFAULT '10',
    subject VARCHAR(100) NOT NULL,
    skill_id UUID NOT NULL,
    container_type VARCHAR(50) NOT NULL,
    question_type VARCHAR(50) NOT NULL,
    
    -- Testing status
    test_status VARCHAR(50) DEFAULT 'not_started' 
        CHECK (test_status IN ('not_started', 'in_progress', 'passed', 'failed', 'blocked')),
    
    -- Test results
    test_date TIMESTAMPTZ,
    tested_by VARCHAR(255),
    test_notes TEXT,
    error_message TEXT,
    
    -- Specific test criteria
    renders_correctly BOOLEAN,
    accepts_input BOOLEAN,
    validates_answer BOOLEAN,
    saves_progress BOOLEAN,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique testing per combination
    UNIQUE(subject, skill_id, container_type, question_type)
);

-- Create indexes for efficient querying
CREATE INDEX idx_testing_status ON question_type_testing(test_status);
CREATE INDEX idx_testing_type ON question_type_testing(question_type);
CREATE INDEX idx_testing_container ON question_type_testing(container_type);

-- SECTION 2: Initialize Testing Records from Queue
-- ================================================================

-- Populate testing tracker from current queue
INSERT INTO question_type_testing (
    queue_id,
    subject,
    skill_id,
    container_type,
    question_type
)
SELECT 
    queue_id,
    subject,
    skill_id::UUID,
    container_type,
    question_type
FROM generation_queue
WHERE student_id = 'Taylor' 
AND grade_level = '10'
AND status = 'pending'
ON CONFLICT (subject, skill_id, container_type, question_type) 
DO NOTHING;

-- SECTION 3: Create Testing Dashboard View
-- ================================================================

CREATE OR REPLACE VIEW testing_dashboard AS
WITH question_type_order AS (
    SELECT column1 as question_type, column2 as sort_order
    FROM (VALUES
        ('multiple_choice', 1),
        ('true_false', 2),
        ('fill_blank', 3),
        ('numeric', 4),
        ('matching', 5),
        ('ordering', 6),
        ('short_answer', 7),
        ('essay', 8),
        ('drag_drop', 9),
        ('multi_select', 10),
        ('slider', 11),
        ('hotspot', 12),
        ('diagram_label', 13),
        ('graph_plot', 14),
        ('table_complete', 15)
    ) AS qt(column1, column2)
)
SELECT 
    qtt.question_type,
    qto.sort_order,
    COUNT(*) FILTER (WHERE test_status = 'passed') as passed,
    COUNT(*) FILTER (WHERE test_status = 'failed') as failed,
    COUNT(*) FILTER (WHERE test_status = 'blocked') as blocked,
    COUNT(*) FILTER (WHERE test_status = 'in_progress') as in_progress,
    COUNT(*) FILTER (WHERE test_status = 'not_started') as not_started,
    COUNT(*) as total,
    ROUND(100.0 * COUNT(*) FILTER (WHERE test_status = 'passed') / COUNT(*), 1) as pass_rate
FROM question_type_testing qtt
JOIN question_type_order qto ON qtt.question_type = qto.question_type
GROUP BY qtt.question_type, qto.sort_order
ORDER BY qto.sort_order;

-- SECTION 4: Create Subject Progress View
-- ================================================================

CREATE OR REPLACE VIEW subject_testing_progress AS
SELECT 
    subject,
    container_type,
    COUNT(*) FILTER (WHERE test_status = 'passed') as passed,
    COUNT(*) FILTER (WHERE test_status = 'failed') as failed,
    COUNT(*) FILTER (WHERE test_status IN ('not_started', 'in_progress', 'blocked')) as remaining,
    COUNT(*) as total,
    ROUND(100.0 * COUNT(*) FILTER (WHERE test_status = 'passed') / COUNT(*), 1) as completion_rate
FROM question_type_testing
GROUP BY subject, container_type
ORDER BY subject, container_type;

-- SECTION 5: Helper Functions for Testing
-- ================================================================

-- Function to mark a test as passed
CREATE OR REPLACE FUNCTION mark_test_passed(
    p_subject VARCHAR,
    p_container VARCHAR,
    p_question_type VARCHAR,
    p_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE question_type_testing
    SET 
        test_status = 'passed',
        test_date = NOW(),
        test_notes = p_notes,
        renders_correctly = true,
        accepts_input = true,
        validates_answer = true,
        saves_progress = true,
        updated_at = NOW()
    WHERE subject = p_subject
    AND container_type = p_container
    AND question_type = p_question_type;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to mark a test as failed
CREATE OR REPLACE FUNCTION mark_test_failed(
    p_subject VARCHAR,
    p_container VARCHAR,
    p_question_type VARCHAR,
    p_error TEXT,
    p_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE question_type_testing
    SET 
        test_status = 'failed',
        test_date = NOW(),
        error_message = p_error,
        test_notes = p_notes,
        updated_at = NOW()
    WHERE subject = p_subject
    AND container_type = p_container
    AND question_type = p_question_type;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to get next test to run
CREATE OR REPLACE FUNCTION get_next_test()
RETURNS TABLE (
    subject VARCHAR,
    container_type VARCHAR,
    question_type VARCHAR,
    skill_id UUID,
    queue_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        qtt.subject,
        qtt.container_type,
        qtt.question_type,
        qtt.skill_id,
        qtt.queue_id
    FROM question_type_testing qtt
    WHERE qtt.test_status = 'not_started'
    ORDER BY 
        CASE qtt.question_type
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
        END,
        qtt.subject,
        qtt.container_type
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- SECTION 6: Testing Reports
-- ================================================================

-- Overall testing summary
CREATE OR REPLACE VIEW testing_summary AS
SELECT 
    COUNT(*) as total_tests,
    COUNT(*) FILTER (WHERE test_status = 'passed') as passed,
    COUNT(*) FILTER (WHERE test_status = 'failed') as failed,
    COUNT(*) FILTER (WHERE test_status = 'blocked') as blocked,
    COUNT(*) FILTER (WHERE test_status = 'not_started') as not_started,
    ROUND(100.0 * COUNT(*) FILTER (WHERE test_status = 'passed') / COUNT(*), 1) as overall_pass_rate,
    COUNT(DISTINCT question_type) as question_types_total,
    COUNT(DISTINCT question_type) FILTER (WHERE test_status = 'passed') as question_types_passed
FROM question_type_testing;

-- Failed tests detail
CREATE OR REPLACE VIEW failed_tests AS
SELECT 
    subject,
    container_type,
    question_type,
    error_message,
    test_notes,
    test_date
FROM question_type_testing
WHERE test_status = 'failed'
ORDER BY test_date DESC;

-- SECTION 7: Quick Testing Commands
-- ================================================================

/*
TESTING WORKFLOW COMMANDS:

1. View overall progress:
   SELECT * FROM testing_summary;

2. View progress by question type:
   SELECT * FROM testing_dashboard;

3. View progress by subject:
   SELECT * FROM subject_testing_progress;

4. Get next test to run:
   SELECT * FROM get_next_test();

5. Mark a test as passed:
   SELECT mark_test_passed('Math', 'learn', 'multiple_choice', 'Works perfectly!');

6. Mark a test as failed:
   SELECT mark_test_failed('Math', 'learn', 'drag_drop', 'Drag elements not rendering', 'Missing drag handlers');

7. View all failed tests:
   SELECT * FROM failed_tests;

8. Check specific question type across all subjects:
   SELECT subject, container_type, test_status, test_notes
   FROM question_type_testing
   WHERE question_type = 'multiple_choice'
   ORDER BY subject, container_type;

9. Reset a test to try again:
   UPDATE question_type_testing
   SET test_status = 'not_started', 
       test_date = NULL,
       error_message = NULL,
       test_notes = NULL
   WHERE subject = 'Math' 
   AND container_type = 'learn' 
   AND question_type = 'multiple_choice';

10. Export results to CSV (for documentation):
    COPY (SELECT * FROM testing_dashboard) 
    TO '/tmp/testing_results.csv' 
    WITH CSV HEADER;
*/

-- Initial Summary
SELECT 'Testing Tracker Created!' as status,
       COUNT(*) as total_tests_to_run,
       COUNT(DISTINCT question_type) as unique_question_types,
       COUNT(DISTINCT subject) as subjects,
       COUNT(DISTINCT container_type) as containers
FROM question_type_testing;