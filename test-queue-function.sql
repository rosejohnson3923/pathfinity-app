-- Test the get_next_queue_item function with the actual worker_id

-- 1. First, add some test items to the queue if it's empty
INSERT INTO generation_queue (
    student_id, 
    grade_level, 
    subject, 
    skill_id, 
    container_type, 
    question_type, 
    status
) VALUES 
    ('taylor-10th', '10', 'Algebra 1', 'A.1', 'learn', 'multiple_choice', 'pending'),
    ('taylor-10th', '10', 'Science', 'S.1', 'learn', 'true_false', 'pending'),
    ('taylor-10th', '10', 'ELA', 'E.1', 'learn', 'fill_blank', 'pending')
ON CONFLICT DO NOTHING;

-- 2. Check what's in the queue
SELECT queue_id, subject, question_type, status 
FROM generation_queue 
WHERE status = 'pending'
LIMIT 5;

-- 3. Test the function with the actual worker_id
SELECT * FROM get_next_queue_item('03ed8a52-ebf5-45ef-af7c-ae2d1514e9b2'::uuid);

-- 4. If the above returns an error, let's check what columns the function expects
SELECT 
    proname,
    pg_get_function_arguments(oid) as arguments,
    pg_get_function_result(oid) as result
FROM pg_proc 
WHERE proname = 'get_next_queue_item';

-- 5. Check if there's a column mismatch issue
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'generation_queue'
ORDER BY ordinal_position;