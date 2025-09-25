-- ================================================================
-- PATHFINITY DATABASE MIGRATION 009: DISABLE RLS ON LEARNING SESSIONS
-- Version: 1.0.0
-- Description: Temporarily disable RLS on learning_sessions table for API access
-- Date: 2025-01-09
-- ================================================================

-- Disable RLS on learning_sessions table
-- The API server uses service role key which should bypass RLS anyway
ALTER TABLE learning_sessions DISABLE ROW LEVEL SECURITY;

-- Also disable RLS on related tables
ALTER TABLE session_analytics DISABLE ROW LEVEL SECURITY;
ALTER TABLE session_achievements DISABLE ROW LEVEL SECURITY;

-- Note: In production, we should add proper RLS policies instead
-- For now, the API server with service role key handles authorization