-- ================================================================
-- PATHFINITY DATABASE MIGRATION 009: RLS POLICIES FOR LEARNING SESSIONS
-- Version: 1.0.0
-- Description: Add Row Level Security policies for learning_sessions tables
-- Date: 2025-01-09
-- ================================================================

-- Enable RLS on all session tables
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_achievements ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- LEARNING_SESSIONS POLICIES
-- ================================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own sessions" ON learning_sessions;
DROP POLICY IF EXISTS "Users can create their own sessions" ON learning_sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON learning_sessions;
DROP POLICY IF EXISTS "Service role can do everything" ON learning_sessions;

-- Service role bypass (for API server)
CREATE POLICY "Service role can do everything"
ON learning_sessions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Users can view their own sessions
CREATE POLICY "Users can view their own sessions"
ON learning_sessions
FOR SELECT
TO authenticated, anon
USING (
  user_id::text = auth.uid()::text
  OR is_demo = true
);

-- Users can create their own sessions
CREATE POLICY "Users can create their own sessions"
ON learning_sessions
FOR INSERT
TO authenticated, anon
WITH CHECK (
  user_id::text = auth.uid()::text
  OR is_demo = true
);

-- Users can update their own sessions
CREATE POLICY "Users can update their own sessions"
ON learning_sessions
FOR UPDATE
TO authenticated, anon
USING (
  user_id::text = auth.uid()::text
  OR is_demo = true
)
WITH CHECK (
  user_id::text = auth.uid()::text
  OR is_demo = true
);

-- ================================================================
-- SESSION_ANALYTICS POLICIES
-- ================================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own analytics" ON session_analytics;
DROP POLICY IF EXISTS "Users can create their own analytics" ON session_analytics;
DROP POLICY IF EXISTS "Service role can do everything" ON session_analytics;

-- Service role bypass
CREATE POLICY "Service role can do everything"
ON session_analytics
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Users can view their own analytics
CREATE POLICY "Users can view their own analytics"
ON session_analytics
FOR SELECT
TO authenticated, anon
USING (
  user_id::text = auth.uid()::text
);

-- Users can create their own analytics
CREATE POLICY "Users can create their own analytics"
ON session_analytics
FOR INSERT
TO authenticated, anon
WITH CHECK (
  user_id::text = auth.uid()::text
);

-- ================================================================
-- SESSION_ACHIEVEMENTS POLICIES
-- ================================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own achievements" ON session_achievements;
DROP POLICY IF EXISTS "Users can create their own achievements" ON session_achievements;
DROP POLICY IF EXISTS "Service role can do everything" ON session_achievements;

-- Service role bypass
CREATE POLICY "Service role can do everything"
ON session_achievements
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Users can view their own achievements
CREATE POLICY "Users can view their own achievements"
ON session_achievements
FOR SELECT
TO authenticated, anon
USING (
  user_id::text = auth.uid()::text
);

-- Users can create their own achievements
CREATE POLICY "Users can create their own achievements"
ON session_achievements
FOR INSERT
TO authenticated, anon
WITH CHECK (
  user_id::text = auth.uid()::text
);

-- ================================================================
-- NOTES
-- ================================================================
-- The service_role policies allow the API server (using service role key)
-- to bypass all RLS restrictions and perform any operations
--
-- The authenticated/anon policies allow users to manage their own data
-- Demo sessions (is_demo = true) can be accessed by anyone for testing