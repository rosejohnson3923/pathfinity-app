-- ================================================================
-- PATHFINITY DATABASE MIGRATION 008: LEARNING SESSIONS (STANDALONE)
-- Version: 1.0.0 - Standalone version without foreign key dependencies
-- Description: Session-based journey persistence for tracking career/companion choices
-- Date: 2025-01-09
-- ================================================================
--
-- This version works even if users/tenants tables don't exist yet
-- Foreign keys will be added later when base tables are available
-- ================================================================

-- ================================================================
-- LEARNING SESSIONS TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS learning_sessions (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- User Reference (no foreign key for standalone)
    user_id UUID NOT NULL,
    tenant_id UUID,

    -- Career & Companion Selection
    career_id TEXT NOT NULL,
    career_name TEXT NOT NULL,
    companion_id TEXT NOT NULL,
    companion_name TEXT NOT NULL,

    -- Session Configuration
    session_timeout_hours INTEGER DEFAULT 8,

    -- Session State
    is_active BOOLEAN DEFAULT true,
    completed_at TIMESTAMP WITH TIME ZONE,
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Progress Tracking
    container_progress JSONB DEFAULT '{}',
    current_container TEXT,
    current_subject TEXT,
    subjects_completed INTEGER DEFAULT 0,

    -- Master Narrative Cache (Learn container only)
    master_narrative_cache TEXT,
    master_narrative_generated_at TIMESTAMP WITH TIME ZONE,

    -- Analytics & Metrics
    total_time_spent INTEGER DEFAULT 0,
    achievement_count INTEGER DEFAULT 0,
    highest_score INTEGER,
    average_score DECIMAL(5,2),

    -- Demo/Test Isolation
    is_demo BOOLEAN DEFAULT false,

    -- Abandonment Tracking
    session_abandoned BOOLEAN DEFAULT false,
    abandon_reason TEXT,
    abandon_timestamp TIMESTAMP WITH TIME ZONE,

    -- Session Metadata
    session_metadata JSONB DEFAULT '{}',

    -- Previous Session Link (for tracking career switches)
    previous_session_id UUID,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- SESSION ANALYTICS EVENTS TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS session_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    user_id UUID NOT NULL,

    -- Event Information
    event_type TEXT NOT NULL,
    event_data JSONB DEFAULT '{}',
    event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Context
    container_context TEXT,
    subject_context TEXT,
    skill_context TEXT,

    -- Performance Metrics
    response_time_ms INTEGER,
    accuracy_score DECIMAL(5,2),

    -- Created timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- SESSION ACHIEVEMENTS TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS session_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    user_id UUID NOT NULL,

    -- Achievement Details
    achievement_type TEXT NOT NULL,
    achievement_name TEXT NOT NULL,
    achievement_description TEXT,
    achievement_icon TEXT,

    -- Achievement Value
    points_earned INTEGER DEFAULT 0,
    badge_level TEXT,

    -- Context
    earned_in_container TEXT,
    earned_in_subject TEXT,

    -- Metadata
    achievement_data JSONB DEFAULT '{}',

    -- Timestamps
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- INDEXES FOR PERFORMANCE
-- ================================================================

-- Learning Sessions Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON learning_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON learning_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_last_activity ON learning_sessions(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_demo ON learning_sessions(is_demo) WHERE is_demo = true;
CREATE INDEX IF NOT EXISTS idx_sessions_active ON learning_sessions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_sessions_career ON learning_sessions(career_id);

-- Analytics Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_session ON session_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user ON session_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON session_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON session_analytics(event_timestamp DESC);

-- Achievements Indexes
CREATE INDEX IF NOT EXISTS idx_achievements_session ON session_achievements(session_id);
CREATE INDEX IF NOT EXISTS idx_achievements_user ON session_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON session_achievements(achievement_type);

-- ================================================================
-- HELPER FUNCTIONS
-- ================================================================

-- Function to expire inactive sessions
CREATE OR REPLACE FUNCTION expire_inactive_sessions()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    WITH expired AS (
        UPDATE learning_sessions
        SET
            is_active = false,
            session_abandoned = true,
            abandon_reason = 'Session timeout',
            abandon_timestamp = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE
            is_active = true
            AND last_activity_at < CURRENT_TIMESTAMP -
                (INTERVAL '1 hour' * COALESCE(session_timeout_hours, 8))
        RETURNING 1
    )
    SELECT COUNT(*) INTO expired_count FROM expired;

    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get active session for user
CREATE OR REPLACE FUNCTION get_active_session(p_user_id UUID)
RETURNS TABLE (
    session_id UUID,
    career_id TEXT,
    career_name TEXT,
    companion_id TEXT,
    companion_name TEXT,
    container_progress JSONB,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    hours_inactive NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ls.id AS session_id,
        ls.career_id,
        ls.career_name,
        ls.companion_id,
        ls.companion_name,
        ls.container_progress,
        ls.last_activity_at,
        EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - ls.last_activity_at)) / 3600 AS hours_inactive
    FROM learning_sessions ls
    WHERE
        ls.user_id = p_user_id
        AND ls.is_active = true
        AND ls.last_activity_at > CURRENT_TIMESTAMP -
            (INTERVAL '1 hour' * COALESCE(ls.session_timeout_hours, 8))
    ORDER BY ls.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate session statistics
CREATE OR REPLACE FUNCTION get_session_stats(p_session_id UUID)
RETURNS TABLE (
    total_subjects INTEGER,
    completed_subjects INTEGER,
    completion_percentage NUMERIC,
    total_time_minutes INTEGER,
    average_score NUMERIC,
    achievement_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(
            (SELECT COUNT(DISTINCT subject_context)
             FROM session_analytics
             WHERE session_id = p_session_id
             AND event_type = 'subject_started'),
            0
        )::INTEGER AS total_subjects,

        COALESCE(
            (SELECT COUNT(DISTINCT subject_context)
             FROM session_analytics
             WHERE session_id = p_session_id
             AND event_type = 'subject_completed'),
            0
        )::INTEGER AS completed_subjects,

        CASE
            WHEN (SELECT COUNT(DISTINCT subject_context)
                  FROM session_analytics
                  WHERE session_id = p_session_id
                  AND event_type = 'subject_started') > 0
            THEN ROUND(
                100.0 * (SELECT COUNT(DISTINCT subject_context)
                        FROM session_analytics
                        WHERE session_id = p_session_id
                        AND event_type = 'subject_completed') /
                       (SELECT COUNT(DISTINCT subject_context)
                        FROM session_analytics
                        WHERE session_id = p_session_id
                        AND event_type = 'subject_started'),
                1
            )
            ELSE 0
        END AS completion_percentage,

        COALESCE(
            (SELECT total_time_spent / 60
             FROM learning_sessions
             WHERE id = p_session_id),
            0
        )::INTEGER AS total_time_minutes,

        COALESCE(
            (SELECT average_score
             FROM learning_sessions
             WHERE id = p_session_id),
            0
        ) AS average_score,

        COALESCE(
            (SELECT COUNT(*)
             FROM session_achievements
             WHERE session_id = p_session_id),
            0
        )::INTEGER AS achievement_count;
END;
$$ LANGUAGE plpgsql;

-- Function to track analytics event
CREATE OR REPLACE FUNCTION track_analytics_event(
    p_session_id UUID,
    p_user_id UUID,
    p_event_type TEXT,
    p_event_data JSONB DEFAULT '{}',
    p_container TEXT DEFAULT NULL,
    p_subject TEXT DEFAULT NULL,
    p_skill TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    event_id UUID;
BEGIN
    INSERT INTO session_analytics (
        session_id,
        user_id,
        event_type,
        event_data,
        container_context,
        subject_context,
        skill_context
    ) VALUES (
        p_session_id,
        p_user_id,
        p_event_type,
        p_event_data,
        p_container,
        p_subject,
        p_skill
    ) RETURNING id INTO event_id;

    -- Update last activity timestamp on session
    UPDATE learning_sessions
    SET
        last_activity_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_session_id;

    RETURN event_id;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================================

-- Enable RLS on tables
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for learning_sessions
CREATE POLICY "Users can view their own sessions"
    ON learning_sessions FOR SELECT
    USING (auth.uid()::UUID = user_id);

CREATE POLICY "Users can create their own sessions"
    ON learning_sessions FOR INSERT
    WITH CHECK (auth.uid()::UUID = user_id);

CREATE POLICY "Users can update their own sessions"
    ON learning_sessions FOR UPDATE
    USING (auth.uid()::UUID = user_id);

-- RLS Policies for session_analytics
CREATE POLICY "Users can view their own analytics"
    ON session_analytics FOR SELECT
    USING (auth.uid()::UUID = user_id);

CREATE POLICY "Users can insert their own analytics"
    ON session_analytics FOR INSERT
    WITH CHECK (auth.uid()::UUID = user_id);

-- RLS Policies for session_achievements
CREATE POLICY "Users can view their own achievements"
    ON session_achievements FOR SELECT
    USING (auth.uid()::UUID = user_id);

CREATE POLICY "Users can earn achievements"
    ON session_achievements FOR INSERT
    WITH CHECK (auth.uid()::UUID = user_id);

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================

DO $$
BEGIN
    RAISE NOTICE 'Learning Sessions migration completed successfully!';
    RAISE NOTICE 'Tables created: learning_sessions, session_analytics, session_achievements';
    RAISE NOTICE 'Indexes created: 11';
    RAISE NOTICE 'Functions created: 4';
    RAISE NOTICE 'RLS policies created: 7';
END $$;