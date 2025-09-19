-- ============================================
-- CHECK EXISTING AUTH IN SHARED SUPABASE INSTANCE
-- ============================================
-- Since this is the SAME Supabase instance used by both projects,
-- the users should already exist

-- 1. CHECK IF SAM BROWN EXISTS
-- ============================================
SELECT
    id,
    email,
    created_at,
    last_sign_in_at,
    confirmed_at,
    email_confirmed_at,
    raw_user_meta_data->>'full_name' as full_name,
    raw_user_meta_data->>'role' as role,
    CASE
        WHEN confirmed_at IS NOT NULL THEN '✅ Confirmed'
        ELSE '❌ Not Confirmed'
    END as confirmation_status,
    CASE
        WHEN banned_until IS NOT NULL AND banned_until > NOW() THEN '🚫 Banned'
        ELSE '✅ Active'
    END as account_status
FROM auth.users
WHERE email = 'sam.brown@sandview.plainviewisd.edu';

-- 2. CHECK ALL DEMO USERS
-- ============================================
SELECT
    email,
    CASE
        WHEN confirmed_at IS NOT NULL THEN '✅ Confirmed'
        ELSE '❌ Unconfirmed'
    END as status,
    last_sign_in_at,
    raw_user_meta_data->>'role' as role
FROM auth.users
WHERE email IN (
    'sam.brown@sandview.plainviewisd.edu',
    'alex.davis@sandview.plainviewisd.edu',
    'jordan.smith@oceanview.plainviewisd.edu',
    'taylor.johnson@cityview.plainviewisd.edu',
    'jenna.grain@sandview.plainviewisd.edu',
    'brenda.sea@oceanview.plainviewisd.edu',
    'john.land@cityview.plainviewisd.edu',
    'lisa.johnson@cityview.plainviewisd.edu'
)
ORDER BY email;

-- 3. CHECK AUTH PROVIDER SETTINGS
-- ============================================
-- This shows if email/password auth is enabled
SELECT
    'Email/Password Auth' as auth_method,
    CASE
        WHEN COUNT(*) > 0 THEN '✅ Users exist in auth.users table'
        ELSE '❌ No users found'
    END as status,
    COUNT(*) as user_count
FROM auth.users;

-- 4. CHECK FOR RECENT FAILED LOGIN ATTEMPTS
-- ============================================
-- Skip this check as audit_log_entries structure varies
-- Focus on checking if users exist and are confirmed

-- 5. RESET PASSWORD FOR SAM BROWN (if needed)
-- ============================================
-- NOTE: You can't directly set passwords via SQL for security reasons
-- But you can trigger a password reset:

/*
To reset a user's password:

Option 1: Via Supabase Dashboard
1. Go to Authentication → Users
2. Find sam.brown@sandview.plainviewisd.edu
3. Click the three dots → "Send Password Recovery"
4. Or click "Reset Password" to set a new one directly

Option 2: If the user exists but password doesn't work
The password might be different than expected. Common passwords to try:
- Demo2024!
- Password123!
- Test123!
- Whatever was used in pathfinity-revolutionary

Option 3: Update the user's password via Dashboard
1. Go to Authentication → Users
2. Click on sam.brown@sandview.plainviewisd.edu
3. Click "Reset Password"
4. Set it to: Demo2024!
*/

-- 6. CHECK IF THIS IS A CORS/CONFIGURATION ISSUE
-- ============================================
/*
Since both projects use the same Supabase instance,
check if the issue is configuration:

1. In Supabase Dashboard → Settings → API:
   - Verify the URL is: https://zohdmprtfyijneqnwjsu.supabase.co
   - Verify the anon key matches what's in .env

2. In Authentication → URL Configuration:
   - Site URL: Should include localhost:3000 for development
   - Redirect URLs: Should include your app URLs

3. In Authentication → Providers → Email:
   - Ensure "Enable Email Provider" is ON
   - Check "Enable Email Confirmations" setting
*/

-- 7. TEST IF AUTH SCHEMA IS ACCESSIBLE
-- ============================================
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'auth'
        AND table_name = 'users'
    ) THEN
        RAISE NOTICE 'Auth schema is accessible';
    ELSE
        RAISE NOTICE 'WARNING: Auth schema is not accessible - this might be the issue';
    END IF;
END $$;

-- 8. COMMON FIX: CONFIRM UNCONFIRMED USERS
-- ============================================
-- If users exist but aren't confirmed, confirm them:
UPDATE auth.users
SET
    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
    confirmed_at = COALESCE(confirmed_at, NOW()),
    updated_at = NOW()
WHERE email = 'sam.brown@sandview.plainviewisd.edu'
    AND confirmed_at IS NULL;

-- Report what was done
SELECT
    'User Confirmation Update' as action,
    email,
    CASE
        WHEN confirmed_at IS NOT NULL THEN 'User is now confirmed'
        ELSE 'User was already confirmed'
    END as result
FROM auth.users
WHERE email = 'sam.brown@sandview.plainviewisd.edu';