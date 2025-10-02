-- ================================================
-- Fix RLS (Row Level Security) for career_paths table
-- ================================================

-- 1. Check if RLS is enabled
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'career_paths';

-- 2. Disable RLS temporarily to allow public read access
-- Career paths should be publicly readable since they're content, not user data
ALTER TABLE career_paths DISABLE ROW LEVEL SECURITY;

-- Alternative: If you want to keep RLS enabled but allow public reads:
-- ALTER TABLE career_paths ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if any
DROP POLICY IF EXISTS "Allow public read access" ON career_paths;
DROP POLICY IF EXISTS "Allow authenticated read access" ON career_paths;
DROP POLICY IF EXISTS "career_paths_read_policy" ON career_paths;

-- 4. Create a policy that allows everyone to read careers
-- (Only if you want to keep RLS enabled)
-- CREATE POLICY "Allow public read access" ON career_paths
--     FOR SELECT
--     TO public
--     USING (true);

-- 5. Grant necessary permissions
GRANT SELECT ON career_paths TO anon;
GRANT SELECT ON career_paths TO authenticated;

-- 6. Verify the table has data
SELECT COUNT(*) as total_careers FROM career_paths;

-- 7. Test a simple query
SELECT
    career_code,
    career_name,
    icon,
    color,
    grade_category,
    access_tier
FROM career_paths
LIMIT 10;

-- 8. Check if there are any RLS policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'career_paths';

-- 9. Verify permissions
SELECT
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'career_paths';