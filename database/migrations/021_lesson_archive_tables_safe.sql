-- ================================================
-- Lesson Archive System Tables (SAFE VERSION)
-- Stores metadata for lesson plans in Azure Storage
-- ================================================

-- Main lesson archive table
CREATE TABLE IF NOT EXISTS lesson_archives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id VARCHAR(100) UNIQUE NOT NULL,

    -- Student information
    student_name VARCHAR(200) NOT NULL,
    student_id UUID, -- Optional link to users table
    grade_level VARCHAR(10) NOT NULL,

    -- Career information
    career_code VARCHAR(100),
    career_name VARCHAR(200) NOT NULL,

    -- Curriculum alignment
    subject VARCHAR(50) NOT NULL,
    standard_code VARCHAR(20),
    skill_objective TEXT NOT NULL,

    -- Template/subscription info
    template_type VARCHAR(50) NOT NULL,
    subscription_tier VARCHAR(20) DEFAULT 'select',

    -- Dates
    lesson_date DATE NOT NULL DEFAULT CURRENT_DATE,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Azure Storage URLs
    json_url TEXT, -- micro-content container
    pdf_url TEXT, -- content-exports container
    narrative_url TEXT, -- master-narratives container

    -- File metadata
    pdf_size_kb INTEGER,

    -- Status tracking
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived', 'deleted')),
    completion_percentage INTEGER DEFAULT 0,

    -- Performance metrics
    time_spent_minutes INTEGER,
    assessment_score DECIMAL(5,2),
    spark_interactions INTEGER,

    -- Access tracking
    parent_viewed BOOLEAN DEFAULT false,
    parent_viewed_at TIMESTAMP,
    teacher_viewed BOOLEAN DEFAULT false,
    teacher_viewed_at TIMESTAMP,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMP
);

-- Create indexes with IF NOT EXISTS
CREATE INDEX IF NOT EXISTS idx_student_date ON lesson_archives(student_name, lesson_date DESC);
CREATE INDEX IF NOT EXISTS idx_career ON lesson_archives(career_code);
CREATE INDEX IF NOT EXISTS idx_status ON lesson_archives(status);
CREATE INDEX IF NOT EXISTS idx_lesson_date ON lesson_archives(lesson_date DESC);

-- Parent access logs
CREATE TABLE IF NOT EXISTS parent_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id VARCHAR(100) REFERENCES lesson_archives(lesson_id),

    -- Access information
    access_link TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,

    -- Usage tracking
    accessed BOOLEAN DEFAULT false,
    accessed_at TIMESTAMP,
    access_count INTEGER DEFAULT 0,

    -- Who accessed
    parent_email VARCHAR(255),
    ip_address INET,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bulk export tracking
CREATE TABLE IF NOT EXISTS bulk_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    export_id VARCHAR(100) UNIQUE NOT NULL,

    -- Export parameters
    student_name VARCHAR(200) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,

    -- Export details
    lesson_count INTEGER NOT NULL,
    total_size_mb DECIMAL(10,2),

    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),

    -- Azure Storage URL
    export_url TEXT,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Lesson metrics for analytics
CREATE TABLE IF NOT EXISTS lesson_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id VARCHAR(100) REFERENCES lesson_archives(lesson_id),

    -- Engagement metrics
    total_time_seconds INTEGER DEFAULT 0,
    learn_time_seconds INTEGER DEFAULT 0,
    video_time_seconds INTEGER DEFAULT 0,
    practice_time_seconds INTEGER DEFAULT 0,
    assessment_time_seconds INTEGER DEFAULT 0,

    -- Interaction metrics
    clicks_count INTEGER DEFAULT 0,
    hints_used INTEGER DEFAULT 0,
    retries_count INTEGER DEFAULT 0,

    -- Spark AI metrics
    spark_messages_count INTEGER DEFAULT 0,
    spark_hints_given INTEGER DEFAULT 0,
    spark_encouragements INTEGER DEFAULT 0,

    -- Completion metrics
    learn_completed BOOLEAN DEFAULT false,
    video_completed BOOLEAN DEFAULT false,
    practice_completed BOOLEAN DEFAULT false,
    assessment_completed BOOLEAN DEFAULT false,

    -- Scores
    practice_score DECIMAL(5,2),
    assessment_score DECIMAL(5,2),
    final_score DECIMAL(5,2),

    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student portfolios (best work)
CREATE TABLE IF NOT EXISTS student_portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_name VARCHAR(200) NOT NULL,
    lesson_id VARCHAR(100) REFERENCES lesson_archives(lesson_id),

    -- Portfolio categorization
    category VARCHAR(50) CHECK (category IN ('best_work', 'most_improved', 'creative', 'mastery', 'milestone')),

    -- Notes
    teacher_notes TEXT,
    parent_notes TEXT,
    student_reflection TEXT,

    -- Visibility
    is_public BOOLEAN DEFAULT false,
    share_token VARCHAR(100) UNIQUE,

    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    added_by VARCHAR(200),

    UNIQUE(student_name, lesson_id)
);

-- Functions for common queries

-- Get recent lessons for a student
CREATE OR REPLACE FUNCTION get_recent_lessons(
    p_student_name VARCHAR,
    p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
    lesson_id VARCHAR,
    lesson_date DATE,
    career_name VARCHAR,
    subject VARCHAR,
    skill_objective TEXT,
    pdf_url TEXT,
    completion_percentage INTEGER,
    assessment_score DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        la.lesson_id,
        la.lesson_date,
        la.career_name,
        la.subject,
        la.skill_objective,
        la.pdf_url,
        la.completion_percentage,
        la.assessment_score
    FROM lesson_archives la
    WHERE la.student_name = p_student_name
        AND la.lesson_date >= CURRENT_DATE - INTERVAL '1 day' * p_days
    ORDER BY la.lesson_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Get lesson statistics for a period
CREATE OR REPLACE FUNCTION get_lesson_stats(
    p_student_name VARCHAR,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    total_lessons BIGINT,
    completed_lessons BIGINT,
    average_score NUMERIC,
    total_time_minutes BIGINT,
    careers_explored BIGINT,
    favorite_subject VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_lessons,
        COUNT(CASE WHEN status = 'completed' THEN 1 END)::BIGINT as completed_lessons,
        ROUND(AVG(assessment_score), 2) as average_score,
        SUM(time_spent_minutes)::BIGINT as total_time_minutes,
        COUNT(DISTINCT career_code)::BIGINT as careers_explored,
        MODE() WITHIN GROUP (ORDER BY subject) as favorite_subject
    FROM lesson_archives
    WHERE student_name = p_student_name
        AND lesson_date BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) - Only enable if not already enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'lesson_archives'
        AND rowsecurity = true
    ) THEN
        ALTER TABLE lesson_archives ENABLE ROW LEVEL SECURITY;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'parent_access_logs'
        AND rowsecurity = true
    ) THEN
        ALTER TABLE parent_access_logs ENABLE ROW LEVEL SECURITY;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'student_portfolios'
        AND rowsecurity = true
    ) THEN
        ALTER TABLE student_portfolios ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_lesson_archives_updated_at ON lesson_archives;
CREATE TRIGGER update_lesson_archives_updated_at
    BEFORE UPDATE ON lesson_archives
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Initial data check
SELECT
    '✅ Lesson Archive Tables Created' as status,
    COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN ('lesson_archives', 'parent_access_logs', 'bulk_exports', 'lesson_metrics', 'student_portfolios');