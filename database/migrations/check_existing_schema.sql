-- Check existing Career Challenge tables and their structure

-- 1. List all tables that start with 'cc_'
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'cc_%'
ORDER BY table_name;

-- 2. Check if auth.users exists (Supabase auth)
SELECT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'auth'
    AND table_name = 'users'
) as auth_users_exists;

-- 3. Check structure of cc_industries if it exists
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'cc_industries'
ORDER BY ordinal_position;

-- 4. Check structure of cc_game_sessions if it exists
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'cc_game_sessions'
ORDER BY ordinal_position;

-- 5. Check structure of cc_game_session_players if it exists
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'cc_game_session_players'
ORDER BY ordinal_position;

-- 6. Check if cc_challenges exists
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'cc_challenges'
ORDER BY ordinal_position;

-- 7. Check if cc_role_cards exists
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'cc_role_cards'
ORDER BY ordinal_position;