-- ============================================
-- VERIFY WHICH SUPABASE PROJECT THIS IS
-- ============================================
-- Run this in your Supabase SQL Editor to verify you're in the right project

-- 1. CHECK PROJECT IDENTITY
-- ============================================
SELECT current_database() as database_name,
       current_user as current_user,
       version() as postgres_version;

-- 2. LIST ALL TABLES IN PUBLIC SCHEMA
-- ============================================
SELECT
    table_name,
    pg_size_pretty(pg_total_relation_size('"public".'||table_name)) as table_size,
    (SELECT COUNT(*) FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 3. CHECK IF THIS IS THE PATHFINITY-APP PROJECT
-- ============================================
-- Look for tables specific to pathfinity-app vs pathfinity-revolutionary
SELECT
    CASE
        WHEN EXISTS(SELECT 1 FROM information_schema.tables
                   WHERE table_schema = 'public'
                   AND table_name = 'error_logs')
        THEN 'error_logs table EXISTS'
        ELSE 'error_logs table MISSING'
    END as error_logs_status,

    CASE
        WHEN EXISTS(SELECT 1 FROM information_schema.tables
                   WHERE table_schema = 'public'
                   AND table_name = 'skills')
        THEN 'skills table EXISTS'
        ELSE 'skills table MISSING'
    END as skills_status,

    CASE
        WHEN EXISTS(SELECT 1 FROM information_schema.tables
                   WHERE table_schema = 'public'
                   AND table_name = 'students')
        THEN 'students table EXISTS'
        ELSE 'students table MISSING'
    END as students_status;

-- 4. CHECK WHEN TABLES WERE CREATED
-- ============================================
-- This helps identify if tables are from old or new project
SELECT
    schemaname,
    tablename,
    tableowner,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 5. CHECK FOR PROJECT-SPECIFIC DATA
-- ============================================
-- Check if there's any data that would indicate which project this is
SELECT 'Total rows in all tables' as metric,
       SUM(n_live_tup) as count
FROM pg_stat_user_tables
WHERE schemaname = 'public';

-- 6. LIST ALL SCHEMAS
-- ============================================
-- Sometimes tables might be in different schemas
SELECT schema_name
FROM information_schema.schemata
WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
ORDER BY schema_name;

-- 7. CHECK API ACCESSIBILITY
-- ============================================
-- This shows which tables are accessible via PostgREST API
SELECT
    c.relname AS table_name,
    n.nspname AS schema_name,
    CASE
        WHEN n.nspname = 'public' THEN 'API Accessible'
        ELSE 'NOT API Accessible'
    END as api_status,
    obj_description(c.oid) AS table_comment
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r'
    AND n.nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
ORDER BY n.nspname, c.relname;