-- Check if the current authenticated user has a student_profiles record
-- Replace 'YOUR_USER_ID' with your actual user ID from the logs

-- First, see all student_profiles records
SELECT
    id,
    user_id,
    username,
    display_name,
    created_at
FROM student_profiles
ORDER BY created_at DESC
LIMIT 10;

-- Then check auth.users to see what users exist
SELECT
    id,
    email,
    created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- Check if there's a mismatch
SELECT
    u.id as auth_user_id,
    u.email,
    sp.id as student_profile_id,
    sp.display_name
FROM auth.users u
LEFT JOIN student_profiles sp ON sp.user_id = u.id
ORDER BY u.created_at DESC
LIMIT 10;
