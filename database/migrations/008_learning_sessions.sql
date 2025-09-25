-- ================================================================
-- PATHFINITY DATABASE MIGRATION 008: LEARNING SESSIONS
-- Version: 1.0.0
-- Description: Session-based journey persistence for tracking career/companion choices
-- Date: 2025-01-09
-- ================================================================

-- Migration metadata (only if schema_migrations table exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'schema_migrations'
    ) THEN
        INSERT INTO schema_migrations (version, description, checksum)
        VALUES (
            '008_learning_sessions',
            'Session-based journey persistence with career/companion tracking',
            'session_v1_checksum'
        ) ON CONFLICT (version) DO NOTHING;
    END IF;
END $$;

-- ================================================================
-- LEARNING SESSIONS TABLE
-- ================================================================
-- Tracks individual learning sessions with career/companion choices
-- Supports 8-hour timeout for flexible scheduling (homeschool support)
-- Enables PathIQ analytics while maintaining demo isolation

CREATE TABLE IF NOT EXISTS learning_sessions (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- User Reference (without foreign key if users table doesn't exist)
    user_id UUID NOT NULL,
    tenant_id UUID,

    -- Career & Companion Selection
    career_id TEXT NOT NULL,
    career_name TEXT NOT NULL,
    companion_id TEXT NOT NULL,
    companion_name TEXT NOT NULL,

    -- Session Lifecycle
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    session_timeout_hours INTEGER DEFAULT 8, -- Configurable timeout

    -- Current Position in Journey
    current_container TEXT CHECK (current_container IN ('learn', 'experience', 'discover')),
    current_subject TEXT CHECK (current_subject IN ('math', 'ela', 'science', 'social_studies')),

    -- Container Progress Tracking
    -- JSON Structure:
    -- {
    --   "learn": {
    --     "math": { "completed": true, "score": 95, "time_spent": 1200, "completed_at": "2025-01-09T10:30:00Z" },
    --     "ela": { "completed": true, "score": 88, "time_spent": 1100, "completed_at": "2025-01-09T11:00:00Z" },
    --     "science": { "completed": false, "score": 0, "time_spent": 600, "completed_at": null },
    --     "social_studies": { "completed": false, "score": 0, "time_spent": 0, "completed_at": null }
    --   },
    --   "experience": { ... },
    --   "discover": { ... }
    -- }
    container_progress JSONB DEFAULT '{
        "learn": {
            "math": {"completed": false, "score": 0, "time_spent": 0, "completed_at": null},
            "ela": {"completed": false, "score": 0, "time_spent": 0, "completed_at": null},
            "science": {"completed": false, "score": 0, "time_spent": 0, "completed_at": null},
            "social_studies": {"completed": false, "score": 0, "time_spent": 0, "completed_at": null}
        },
        "experience": {
            "math": {"completed": false, "score": 0, "time_spent": 0, "completed_at": null},
            "ela": {"completed": false, "score": 0, "time_spent": 0, "completed_at": null},
            "science": {"completed": false, "score": 0, "time_spent": 0, "completed_at": null},
            "social_studies": {"completed": false, "score": 0, "time_spent": 0, "completed_at": null}
        },
        "discover": {
            "math": {"completed": false, "score": 0, "time_spent": 0, "completed_at": null},
            "ela": {"completed": false, "score": 0, "time_spent": 0, "completed_at": null},
            "science": {"completed": false, "score": 0, "time_spent": 0, "completed_at": null},
            "social_studies": {"completed": false, "score": 0, "time_spent": 0, "completed_at": null}
        }
    }'::jsonb,

    -- Master Narrative Caching (Learn Container Only)
    master_narrative_cache TEXT, -- Stores the generated narrative
    narrative_generated_at TIMESTAMP WITH TIME ZONE,
    narrative_cache_key TEXT, -- Key for cache validation

    -- Analytics & Tracking
    is_demo BOOLEAN DEFAULT false, -- Demo user isolation flag
    session_source TEXT CHECK (session_source IN ('web', 'mobile', 'tablet', 'desktop')),
    session_abandoned BOOLEAN DEFAULT false,
    abandon_reason TEXT CHECK (abandon_reason IN ('timeout', 'user_restart', 'logout', 'switched_career', null)),

    -- Session Metadata
    -- Stores additional context like:
    -- - Browser/device info
    -- - IP location (for timezone)
    -- - Feature flags active during session
    -- - A/B test variants
    session_metadata JSONB DEFAULT '{}',

    -- Previous Session Link (for tracking career switches)
    previous_session_id UUID REFERENCES learning_sessions(id) ON DELETE SET NULL,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- SESSION ANALYTICS EVENTS TABLE
-- ================================================================
-- Tracks granular events within sessions for PathIQ analytics

CREATE TABLE IF NOT EXISTS session_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES learning_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Event Information
    event_type TEXT NOT NULL CHECK (event_type IN (
        'session_started',
        'session_resumed',
        'session_ended',
        'career_selected',
        'companion_selected',
        'career_switched',
        'container_started',
        'container_completed',
        'subject_started',
        'subject_completed',
        'progress_checkpoint',
        'narrative_generated',
        'narrative_cached',
        'achievement_earned',
        'streak_milestone',
        'session_abandoned',
        'restart_requested',
        'restart_confirmed'
    )),

    -- Event Data (flexible JSON for different event types)
    -- Examples:
    -- career_selected: { "career_id": "dentist", "career_name": "Dentist", "reason": "new_session" }
    -- subject_completed: { "container": "learn", "subject": "math", "score": 95, "time_spent": 1200 }
    -- achievement_earned: { "type": "perfect_score", "container": "learn", "subject": "ela", "points": 100 }
    event_data JSONB DEFAULT '{}',

    -- Performance Metrics
    client_timestamp TIMESTAMP WITH TIME ZONE, -- When event occurred on client
    server_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- When received by server
    latency_ms INTEGER GENERATED ALWAYS AS (
        EXTRACT(EPOCH FROM (server_timestamp - client_timestamp)) * 1000
    ) STORED,

    -- Context
    is_demo BOOLEAN DEFAULT false,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- SESSION ACHIEVEMENTS TABLE
-- ================================================================
-- Tracks achievements earned during sessions

CREATE TABLE IF NOT EXISTS session_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES learning_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Achievement Details
    achievement_type TEXT NOT NULL CHECK (achievement_type IN (
        'first_session',
        'subject_complete',
        'container_complete',
        'journey_complete',
        'perfect_score',
        'streak_3',
        'streak_7',
        'streak_30',
        'speed_demon', -- Completed quickly
        'explorer', -- Tried multiple careers
        'dedicated', -- Long session
        'comeback_kid' -- Returned after break
    )),

    -- Achievement Data
    achievement_name TEXT NOT NULL,
    achievement_description TEXT,
    points_earned INTEGER DEFAULT 0,

    -- Context
    container TEXT,
    subject TEXT,

    -- Timestamps
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- INDEXES FOR PERFORMANCE
-- ================================================================

-- Primary lookups
CREATE INDEX idx_sessions_user_active
    ON learning_sessions(user_id, is_active)
    WHERE is_active = true;

CREATE INDEX idx_sessions_last_activity
    ON learning_sessions(last_activity DESC)
    WHERE is_active = true;

-- Demo isolation
CREATE INDEX idx_sessions_demo
    ON learning_sessions(is_demo, created_at DESC)
    WHERE is_demo = true;

-- Container/subject tracking
CREATE INDEX idx_sessions_container_subject
    ON learning_sessions(current_container, current_subject)
    WHERE is_active = true;

-- Career/companion analysis
CREATE INDEX idx_sessions_career_companion
    ON learning_sessions(career_id, companion_id, created_at DESC);

-- Session chaining
CREATE INDEX idx_sessions_previous
    ON learning_sessions(previous_session_id)
    WHERE previous_session_id IS NOT NULL;

-- Analytics events
CREATE INDEX idx_analytics_session
    ON session_analytics(session_id, created_at DESC);

CREATE INDEX idx_analytics_event_type
    ON session_analytics(event_type, created_at DESC);

CREATE INDEX idx_analytics_user
    ON session_analytics(user_id, created_at DESC);

-- Achievements
CREATE INDEX idx_achievements_session
    ON session_achievements(session_id);

CREATE INDEX idx_achievements_user
    ON session_achievements(user_id, earned_at DESC);

CREATE INDEX idx_achievements_type
    ON session_achievements(achievement_type);

-- ================================================================
-- FUNCTIONS & TRIGGERS
-- ================================================================

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_session_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on learning_sessions
CREATE TRIGGER trigger_update_session_updated_at
    BEFORE UPDATE ON learning_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_session_updated_at();

-- Function to check and expire inactive sessions
CREATE OR REPLACE FUNCTION expire_inactive_sessions()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE learning_sessions
    SET
        is_active = false,
        ended_at = CURRENT_TIMESTAMP,
        session_abandoned = true,
        abandon_reason = 'timeout'
    WHERE
        is_active = true
        AND last_activity < CURRENT_TIMESTAMP - (session_timeout_hours || ' hours')::INTERVAL;

    GET DIAGNOSTICS expired_count = ROW_COUNT;
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate session statistics
CREATE OR REPLACE FUNCTION get_session_stats(p_user_id UUID)
RETURNS TABLE(
    total_sessions BIGINT,
    completed_sessions BIGINT,
    average_session_minutes INTEGER,
    favorite_career TEXT,
    favorite_companion TEXT,
    total_subjects_completed INTEGER,
    current_streak INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH session_stats AS (
        SELECT
            COUNT(*) AS total_sessions,
            COUNT(*) FILTER (WHERE NOT session_abandoned) AS completed_sessions,
            AVG(EXTRACT(EPOCH FROM (COALESCE(ended_at, last_activity) - started_at)) / 60)::INTEGER AS avg_minutes,
            MODE() WITHIN GROUP (ORDER BY career_name) AS fav_career,
            MODE() WITHIN GROUP (ORDER BY companion_name) AS fav_companion
        FROM learning_sessions
        WHERE user_id = p_user_id
    ),
    progress_stats AS (
        SELECT
            SUM(
                (container_progress->'learn'->>'math')::jsonb->>'completed' = 'true'::text::int +
                (container_progress->'learn'->>'ela')::jsonb->>'completed' = 'true'::text::int +
                (container_progress->'learn'->>'science')::jsonb->>'completed' = 'true'::text::int +
                (container_progress->'learn'->>'social_studies')::jsonb->>'completed' = 'true'::text::int +
                (container_progress->'experience'->>'math')::jsonb->>'completed' = 'true'::text::int +
                (container_progress->'experience'->>'ela')::jsonb->>'completed' = 'true'::text::int +
                (container_progress->'experience'->>'science')::jsonb->>'completed' = 'true'::text::int +
                (container_progress->'experience'->>'social_studies')::jsonb->>'completed' = 'true'::text::int +
                (container_progress->'discover'->>'math')::jsonb->>'completed' = 'true'::text::int +
                (container_progress->'discover'->>'ela')::jsonb->>'completed' = 'true'::text::int +
                (container_progress->'discover'->>'science')::jsonb->>'completed' = 'true'::text::int +
                (container_progress->'discover'->>'social_studies')::jsonb->>'completed' = 'true'::text::int
            ) AS total_completed
        FROM learning_sessions
        WHERE user_id = p_user_id AND is_active = false
    ),
    streak_stats AS (
        SELECT
            COUNT(*) AS current_streak
        FROM (
            SELECT
                started_at::date,
                ROW_NUMBER() OVER (ORDER BY started_at::date DESC) AS rn
            FROM learning_sessions
            WHERE user_id = p_user_id
            GROUP BY started_at::date
        ) AS daily_sessions
        WHERE started_at = CURRENT_DATE - (rn - 1) * INTERVAL '1 day'
    )
    SELECT
        s.total_sessions,
        s.completed_sessions,
        s.avg_minutes,
        s.fav_career,
        s.fav_companion,
        COALESCE(p.total_completed, 0)::INTEGER,
        COALESCE(st.current_streak, 0)::INTEGER
    FROM session_stats s
    CROSS JOIN progress_stats p
    CROSS JOIN streak_stats st;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- PERMISSIONS (Adjust based on your Supabase RLS needs)
-- ================================================================

-- Enable RLS on tables
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_achievements ENABLE ROW LEVEL SECURITY;

-- Users can only see their own sessions
CREATE POLICY "Users can view own sessions" ON learning_sessions
    FOR SELECT USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can create own sessions" ON learning_sessions
    FOR INSERT WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "Users can update own sessions" ON learning_sessions
    FOR UPDATE USING (auth.uid()::uuid = user_id);

-- Similar policies for analytics and achievements
CREATE POLICY "Users can view own analytics" ON session_analytics
    FOR SELECT USING (auth.uid()::uuid = user_id);

CREATE POLICY "Users can view own achievements" ON session_achievements
    FOR SELECT USING (auth.uid()::uuid = user_id);

-- ================================================================
-- MIGRATION COMPLETION
-- ================================================================

-- Log successful migration
DO $$
BEGIN
    RAISE NOTICE 'Learning Sessions migration (008) completed successfully';
    RAISE NOTICE 'Tables created: learning_sessions, session_analytics, session_achievements';
    RAISE NOTICE 'Indexes created: 11';
    RAISE NOTICE 'Functions created: 4';
    RAISE NOTICE 'RLS policies applied';
END $$;