-- Migration: 006_monitoring_analytics_system.sql
-- Purpose: Create comprehensive monitoring and analytics tables
-- Date: 2025-08-27

-- ================================================================
-- PERFORMANCE METRICS
-- ================================================================

CREATE TABLE IF NOT EXISTS performance_metrics (
    metric_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name VARCHAR(200) NOT NULL,
    event_value DECIMAL(10,2),
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(200),
    session_id VARCHAR(200),
    container_type VARCHAR(50),
    grade VARCHAR(20),
    subject VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_perf_metrics_timestamp (timestamp DESC),
    INDEX idx_perf_metrics_event (event_name),
    INDEX idx_perf_metrics_user (user_id),
    INDEX idx_perf_metrics_session (session_id)
);

-- ================================================================
-- USAGE ANALYTICS
-- ================================================================

CREATE TABLE IF NOT EXISTS usage_analytics (
    analytics_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name VARCHAR(200) NOT NULL,
    event_value DECIMAL(10,2),
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(200),
    session_id VARCHAR(200),
    container_type VARCHAR(50),
    grade VARCHAR(20),
    subject VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_usage_timestamp (timestamp DESC),
    INDEX idx_usage_event (event_name),
    INDEX idx_usage_user (user_id)
);

-- ================================================================
-- BUSINESS METRICS
-- ================================================================

CREATE TABLE IF NOT EXISTS business_metrics (
    metric_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name VARCHAR(200) NOT NULL,
    event_value DECIMAL(10,2) NOT NULL,
    metadata JSONB DEFAULT '{}',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(200),
    session_id VARCHAR(200),
    container_type VARCHAR(50),
    grade VARCHAR(20),
    subject VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_business_timestamp (timestamp DESC),
    INDEX idx_business_event (event_name)
);

-- ================================================================
-- ERROR LOGS
-- ================================================================

CREATE TABLE IF NOT EXISTS error_logs (
    error_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    error_type VARCHAR(100) NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    context JSONB DEFAULT '{}',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(200),
    session_id VARCHAR(200),
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP,
    resolution_notes TEXT,
    
    INDEX idx_errors_timestamp (timestamp DESC),
    INDEX idx_errors_severity (severity),
    INDEX idx_errors_type (error_type),
    INDEX idx_errors_resolved (resolved)
);

-- ================================================================
-- MONITORING ALERTS
-- ================================================================

CREATE TABLE IF NOT EXISTS monitoring_alerts (
    alert_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_type VARCHAR(100) NOT NULL,
    metric_name VARCHAR(200) NOT NULL,
    current_value DECIMAL(10,2),
    threshold_value DECIMAL(10,2),
    severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    alert_message TEXT,
    acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by VARCHAR(200),
    acknowledged_at TIMESTAMP,
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_alerts_created (created_at DESC),
    INDEX idx_alerts_severity (severity),
    INDEX idx_alerts_acknowledged (acknowledged),
    INDEX idx_alerts_resolved (resolved)
);

-- ================================================================
-- LEARNING EVENTS
-- ================================================================

CREATE TABLE IF NOT EXISTS learning_events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    student_id VARCHAR(200) NOT NULL,
    grade VARCHAR(20) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    container_type VARCHAR(50),
    skill_id VARCHAR(200),
    question_type VARCHAR(50),
    is_correct BOOLEAN,
    time_spent INTEGER,
    attempts INTEGER DEFAULT 1,
    score DECIMAL(5,2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_learning_student (student_id),
    INDEX idx_learning_created (created_at DESC),
    INDEX idx_learning_type (event_type),
    INDEX idx_learning_grade_subject (grade, subject)
);

-- ================================================================
-- STUDENT PROGRESS
-- ================================================================

CREATE TABLE IF NOT EXISTS student_progress (
    progress_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id VARCHAR(200) NOT NULL,
    grade VARCHAR(20) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    skills_mastered TEXT[],
    last_skill_completed VARCHAR(200),
    last_score DECIMAL(5,2),
    current_streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    total_time_spent INTEGER DEFAULT 0,
    total_questions_answered INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    mastery_percentage DECIMAL(5,2),
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(student_id, grade, subject),
    INDEX idx_progress_student (student_id),
    INDEX idx_progress_grade_subject (grade, subject),
    INDEX idx_progress_last_active (last_active DESC)
);

-- ================================================================
-- CONTAINER ANALYTICS
-- ================================================================

CREATE TABLE IF NOT EXISTS container_analytics (
    analytics_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id VARCHAR(200) NOT NULL,
    container_type VARCHAR(50) NOT NULL,
    questions_answered INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    accuracy DECIMAL(5,2),
    time_spent INTEGER,
    avg_time_per_question DECIMAL(10,2),
    metadata JSONB DEFAULT '{}',
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_container_student (student_id),
    INDEX idx_container_type (container_type),
    INDEX idx_container_completed (completed_at DESC)
);

-- ================================================================
-- HEALTH CHECK TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS health_check (
    check_id SERIAL PRIMARY KEY,
    status VARCHAR(20) DEFAULT 'healthy',
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial health check record
INSERT INTO health_check (status) VALUES ('healthy');

-- ================================================================
-- AGGREGATED METRICS (Materialized Views)
-- ================================================================

-- Hourly performance aggregation
CREATE TABLE IF NOT EXISTS hourly_performance_summary (
    summary_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hour_timestamp TIMESTAMP NOT NULL,
    avg_response_time DECIMAL(10,2),
    total_requests INTEGER,
    error_count INTEGER,
    error_rate DECIMAL(5,2),
    cache_hit_rate DECIMAL(5,2),
    active_users INTEGER,
    questions_generated INTEGER,
    detection_accuracy DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(hour_timestamp),
    INDEX idx_hourly_timestamp (hour_timestamp DESC)
);

-- Daily learning summary
CREATE TABLE IF NOT EXISTS daily_learning_summary (
    summary_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    grade VARCHAR(20) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    total_students INTEGER,
    total_questions INTEGER,
    correct_answers INTEGER,
    accuracy_rate DECIMAL(5,2),
    avg_time_per_question DECIMAL(10,2),
    most_used_container VARCHAR(50),
    most_difficult_skill VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(date, grade, subject),
    INDEX idx_daily_date (date DESC),
    INDEX idx_daily_grade_subject (grade, subject)
);

-- ================================================================
-- FUNCTIONS FOR METRICS AGGREGATION
-- ================================================================

-- Function to calculate hourly performance metrics
CREATE OR REPLACE FUNCTION calculate_hourly_metrics()
RETURNS VOID AS $$
DECLARE
    v_hour_start TIMESTAMP;
    v_hour_end TIMESTAMP;
    v_avg_response_time DECIMAL;
    v_total_requests INTEGER;
    v_error_count INTEGER;
    v_cache_hits INTEGER;
    v_cache_total INTEGER;
    v_active_users INTEGER;
BEGIN
    v_hour_start := date_trunc('hour', CURRENT_TIMESTAMP - INTERVAL '1 hour');
    v_hour_end := v_hour_start + INTERVAL '1 hour';
    
    -- Calculate average response time
    SELECT AVG(event_value), COUNT(*)
    INTO v_avg_response_time, v_total_requests
    FROM performance_metrics
    WHERE timestamp >= v_hour_start AND timestamp < v_hour_end
      AND event_name LIKE '%response_time%';
    
    -- Count errors
    SELECT COUNT(*) INTO v_error_count
    FROM error_logs
    WHERE timestamp >= v_hour_start AND timestamp < v_hour_end;
    
    -- Calculate cache hit rate
    SELECT 
        SUM(CASE WHEN hit_count > 0 THEN 1 ELSE 0 END),
        COUNT(*)
    INTO v_cache_hits, v_cache_total
    FROM content_cache_v2
    WHERE created_at >= v_hour_start AND created_at < v_hour_end;
    
    -- Count active users
    SELECT COUNT(DISTINCT user_id) INTO v_active_users
    FROM learning_events
    WHERE created_at >= v_hour_start AND created_at < v_hour_end;
    
    -- Insert or update hourly summary
    INSERT INTO hourly_performance_summary (
        hour_timestamp,
        avg_response_time,
        total_requests,
        error_count,
        error_rate,
        cache_hit_rate,
        active_users
    ) VALUES (
        v_hour_start,
        COALESCE(v_avg_response_time, 0),
        COALESCE(v_total_requests, 0),
        COALESCE(v_error_count, 0),
        CASE WHEN v_total_requests > 0 
            THEN (v_error_count::DECIMAL / v_total_requests * 100)
            ELSE 0 END,
        CASE WHEN v_cache_total > 0
            THEN (v_cache_hits::DECIMAL / v_cache_total * 100)
            ELSE 0 END,
        COALESCE(v_active_users, 0)
    )
    ON CONFLICT (hour_timestamp)
    DO UPDATE SET
        avg_response_time = EXCLUDED.avg_response_time,
        total_requests = EXCLUDED.total_requests,
        error_count = EXCLUDED.error_count,
        error_rate = EXCLUDED.error_rate,
        cache_hit_rate = EXCLUDED.cache_hit_rate,
        active_users = EXCLUDED.active_users;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate daily learning metrics
CREATE OR REPLACE FUNCTION calculate_daily_learning_metrics(p_date DATE)
RETURNS VOID AS $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT DISTINCT grade, subject
        FROM learning_events
        WHERE DATE(created_at) = p_date
    LOOP
        INSERT INTO daily_learning_summary (
            date,
            grade,
            subject,
            total_students,
            total_questions,
            correct_answers,
            accuracy_rate,
            avg_time_per_question
        )
        SELECT
            p_date,
            r.grade,
            r.subject,
            COUNT(DISTINCT student_id),
            COUNT(CASE WHEN event_type = 'question_answered' THEN 1 END),
            COUNT(CASE WHEN event_type = 'question_answered' AND is_correct THEN 1 END),
            CASE WHEN COUNT(CASE WHEN event_type = 'question_answered' THEN 1 END) > 0
                THEN (COUNT(CASE WHEN is_correct THEN 1 END)::DECIMAL / 
                      COUNT(CASE WHEN event_type = 'question_answered' THEN 1 END) * 100)
                ELSE 0 END,
            AVG(time_spent)
        FROM learning_events
        WHERE DATE(created_at) = p_date
          AND grade = r.grade
          AND subject = r.subject
        ON CONFLICT (date, grade, subject)
        DO UPDATE SET
            total_students = EXCLUDED.total_students,
            total_questions = EXCLUDED.total_questions,
            correct_answers = EXCLUDED.correct_answers,
            accuracy_rate = EXCLUDED.accuracy_rate,
            avg_time_per_question = EXCLUDED.avg_time_per_question;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- TRIGGERS FOR AUTO-AGGREGATION
-- ================================================================

-- Trigger to update student progress on learning events
CREATE OR REPLACE FUNCTION update_student_progress()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.event_type IN ('question_answered', 'skill_completed') THEN
        INSERT INTO student_progress (
            student_id,
            grade,
            subject,
            total_questions_answered,
            correct_answers,
            last_active
        ) VALUES (
            NEW.student_id,
            NEW.grade,
            NEW.subject,
            CASE WHEN NEW.event_type = 'question_answered' THEN 1 ELSE 0 END,
            CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
            NEW.created_at
        )
        ON CONFLICT (student_id, grade, subject)
        DO UPDATE SET
            total_questions_answered = student_progress.total_questions_answered + 
                CASE WHEN NEW.event_type = 'question_answered' THEN 1 ELSE 0 END,
            correct_answers = student_progress.correct_answers + 
                CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
            last_active = NEW.created_at,
            updated_at = CURRENT_TIMESTAMP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_student_progress
AFTER INSERT ON learning_events
FOR EACH ROW
EXECUTE FUNCTION update_student_progress();

-- ================================================================
-- INDEXES FOR PERFORMANCE
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_perf_metrics_hour ON performance_metrics(date_trunc('hour', timestamp));
CREATE INDEX IF NOT EXISTS idx_learning_events_hour ON learning_events(date_trunc('hour', created_at));
CREATE INDEX IF NOT EXISTS idx_error_logs_hour ON error_logs(date_trunc('hour', timestamp));
CREATE INDEX IF NOT EXISTS idx_cache_hour ON content_cache_v2(date_trunc('hour', created_at));

-- ================================================================
-- PERMISSIONS
-- ================================================================

-- Grant appropriate permissions if needed
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO your_app_role;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO your_app_role;