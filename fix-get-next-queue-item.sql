-- Debug and fix get_next_queue_item function

-- 1. Check if the function exists and its signature
SELECT 
    proname as function_name,
    pronargs as num_args,
    proargtypes::regtype[] as arg_types,
    prorettype::regtype as return_type
FROM pg_proc 
WHERE proname = 'get_next_queue_item';

-- 2. Check worker exists and is valid
SELECT * FROM generation_workers;

-- 3. If no worker, create one
INSERT INTO generation_workers (worker_name, status, last_heartbeat)
VALUES ('main_worker', 'idle', NOW())
ON CONFLICT (worker_name) 
DO UPDATE SET 
    status = 'idle',
    last_heartbeat = NOW();

-- 4. Get the worker_id for testing
SELECT worker_id FROM generation_workers WHERE worker_name = 'main_worker';

-- 5. Test the function directly with a valid worker_id
-- Replace 'YOUR_WORKER_ID' with the actual UUID from step 4
-- SELECT * FROM get_next_queue_item('YOUR_WORKER_ID'::uuid);

-- 6. Alternative: Create a simpler version of the function
DROP FUNCTION IF EXISTS get_next_queue_item(UUID);

CREATE OR REPLACE FUNCTION get_next_queue_item(p_worker_id UUID)
RETURNS TABLE (
    queue_id UUID,
    student_id VARCHAR,
    grade_level VARCHAR,
    subject VARCHAR,
    skill_id VARCHAR,
    container_type VARCHAR,
    question_type VARCHAR
) 
LANGUAGE plpgsql
AS $$
BEGIN
    -- Simple version that just returns the next pending item
    RETURN QUERY
    SELECT 
        q.queue_id,
        q.student_id,
        q.grade_level,
        q.subject,
        q.skill_id,
        q.container_type,
        q.question_type
    FROM generation_queue q
    WHERE q.status = 'pending'
    ORDER BY q.created_at ASC
    LIMIT 1;
END;
$$;

-- 7. Grant permissions
GRANT EXECUTE ON FUNCTION get_next_queue_item TO authenticated;
GRANT EXECUTE ON FUNCTION get_next_queue_item TO anon;