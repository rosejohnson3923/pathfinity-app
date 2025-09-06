-- ================================================================
-- PATHFINITY DATABASE INDEXES AND PERFORMANCE OPTIMIZATION
-- Comprehensive indexing strategy for high-performance microservices
-- ================================================================

-- ================================================================
-- PRIMARY INDEXES FOR CORE QUERIES
-- ================================================================

-- Users table indexes
CREATE INDEX CONCURRENTLY idx_users_auth_user_id ON users(auth_user_id) WHERE auth_user_id IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_users_email_active ON users(email) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_users_role_active ON users(role) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_users_display_name_trgm ON users USING GIN(display_name gin_trgm_ops);
CREATE INDEX CONCURRENTLY idx_users_created_at ON users(created_at);
CREATE INDEX CONCURRENTLY idx_users_last_login ON users(last_login_at) WHERE last_login_at IS NOT NULL;

-- Student profiles indexes
CREATE INDEX CONCURRENTLY idx_student_profiles_student_id ON student_profiles(student_id) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_student_profiles_user_id ON student_profiles(user_id) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_student_profiles_grade_level ON student_profiles(grade_level) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_student_profiles_school_id ON student_profiles(school_id) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_student_profiles_enrollment_date ON student_profiles(enrollment_date);
CREATE INDEX CONCURRENTLY idx_student_profiles_display_name_trgm ON student_profiles USING GIN(display_name gin_trgm_ops);
CREATE INDEX CONCURRENTLY idx_student_profiles_learning_style ON student_profiles(learning_style) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_student_profiles_grade_school ON student_profiles(grade_level, school_id) WHERE is_active = true;

-- School hierarchy indexes
CREATE INDEX CONCURRENTLY idx_schools_district_id ON schools(district_id) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_schools_principal_id ON schools(principal_id) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_schools_code_district ON schools(district_id, code) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_classes_school_teacher ON classes(school_id, teacher_id) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_classes_grade_level ON classes(grade_level) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_class_enrollments_student ON class_enrollments(student_id, status);
CREATE INDEX CONCURRENTLY idx_class_enrollments_class ON class_enrollments(class_id, status);

-- ================================================================
-- LEARNING ANALYTICS PERFORMANCE INDEXES
-- ================================================================

-- Learning analytics events (high-volume table)
CREATE INDEX CONCURRENTLY idx_learning_events_student_date ON learning_analytics_events(student_id, created_at);
CREATE INDEX CONCURRENTLY idx_learning_events_session ON learning_analytics_events(session_id);
CREATE INDEX CONCURRENTLY idx_learning_events_type_date ON learning_analytics_events(event_type, created_at);
CREATE INDEX CONCURRENTLY idx_learning_events_subject_skill ON learning_analytics_events(subject, skill) WHERE subject IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_learning_events_grade_container ON learning_analytics_events(grade, container) WHERE grade IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_learning_events_character ON learning_analytics_events(character_id) WHERE character_id IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_learning_events_mastery ON learning_analytics_events(mastery_score) WHERE mastery_score IS NOT NULL;

-- Composite indexes for common analytics queries
CREATE INDEX CONCURRENTLY idx_learning_events_student_subject_date ON learning_analytics_events(student_id, subject, created_at);
CREATE INDEX CONCURRENTLY idx_learning_events_student_type_date ON learning_analytics_events(student_id, event_type, created_at);
CREATE INDEX CONCURRENTLY idx_learning_events_grade_subject_date ON learning_analytics_events(grade, subject, created_at) WHERE grade IS NOT NULL;

-- Student progress indexes
CREATE INDEX CONCURRENTLY idx_student_progress_student_subject ON student_progress(student_id, subject);
CREATE INDEX CONCURRENTLY idx_student_progress_mastery ON student_progress(mastery_level) WHERE mastery_level >= 80;
CREATE INDEX CONCURRENTLY idx_student_progress_activity_date ON student_progress(last_activity_date);
CREATE INDEX CONCURRENTLY idx_student_progress_streak ON student_progress(streak_days) WHERE streak_days > 0;

-- Learning outcomes indexes
CREATE INDEX CONCURRENTLY idx_learning_outcomes_student_date ON learning_outcomes(student_id, created_at);
CREATE INDEX CONCURRENTLY idx_learning_outcomes_event_id ON learning_outcomes(event_id) WHERE event_id IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_learning_outcomes_skill ON learning_outcomes(skill) WHERE skill IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_learning_outcomes_mastery ON learning_outcomes(mastery) WHERE mastery >= 80;

-- ================================================================
-- CONTENT AND CURRICULUM INDEXES
-- ================================================================

-- Subjects and curriculum
CREATE INDEX CONCURRENTLY idx_subjects_tenant_active ON subjects(tenant_id) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_subjects_code ON subjects(code) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_subjects_grade_levels ON subjects USING GIN(grade_levels);
CREATE INDEX CONCURRENTLY idx_mastery_groups_subject ON mastery_groups(subject_id) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_mastery_groups_grade_sequence ON mastery_groups(grade_level, sequence_order) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_skills_topics_mastery_group ON skills_topics(mastery_group_id) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_skills_topics_difficulty ON skills_topics(difficulty_level) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_skills_topics_sequence ON skills_topics(mastery_group_id, sequence_order) WHERE is_active = true;

-- Generated content indexes
CREATE INDEX CONCURRENTLY idx_generated_content_type_grade ON generated_content(content_type, grade_level) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_generated_content_subject_skill ON generated_content(subject, skill) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_generated_content_difficulty ON generated_content(difficulty) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_generated_content_quality ON generated_content(quality_score) WHERE quality_score >= 0.8;
CREATE INDEX CONCURRENTLY idx_generated_content_safety ON generated_content(safety_validated, coppa_compliant) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_generated_content_usage ON generated_content(usage_count) WHERE usage_count > 0;

-- Content templates
CREATE INDEX CONCURRENTLY idx_content_templates_type ON content_templates(content_type) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_content_templates_grades ON content_templates USING GIN(grade_range);
CREATE INDEX CONCURRENTLY idx_content_templates_subjects ON content_templates USING GIN(subjects);

-- ================================================================
-- ASSESSMENT SYSTEM INDEXES
-- ================================================================

-- Assessments
CREATE INDEX CONCURRENTLY idx_assessments_student_type ON assessments(student_id, assessment_type) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_assessments_grade_subject ON assessments(grade_level, subject) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_assessments_status ON assessments(status) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_assessments_scheduled ON assessments(scheduled_for) WHERE scheduled_for IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_assessments_expires ON assessments(expires_at) WHERE expires_at IS NOT NULL;

-- Assessment submissions
CREATE INDEX CONCURRENTLY idx_assessment_submissions_assessment ON assessment_submissions(assessment_id);
CREATE INDEX CONCURRENTLY idx_assessment_submissions_student ON assessment_submissions(student_id);
CREATE INDEX CONCURRENTLY idx_assessment_submissions_status ON assessment_submissions(status);
CREATE INDEX CONCURRENTLY idx_assessment_submissions_submit_time ON assessment_submissions(submit_time);
CREATE INDEX CONCURRENTLY idx_assessment_submissions_student_time ON assessment_submissions(student_id, submit_time);

-- Grading results
CREATE INDEX CONCURRENTLY idx_grading_results_submission ON grading_results(submission_id);
CREATE INDEX CONCURRENTLY idx_grading_results_student ON grading_results(student_id);
CREATE INDEX CONCURRENTLY idx_grading_results_assessment ON grading_results(assessment_id);
CREATE INDEX CONCURRENTLY idx_grading_results_graded_at ON grading_results(graded_at);
CREATE INDEX CONCURRENTLY idx_grading_results_final ON grading_results(is_final) WHERE is_final = true;

-- Rubrics
CREATE INDEX CONCURRENTLY idx_assessment_rubrics_subject ON assessment_rubrics(subject) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_assessment_rubrics_grades ON assessment_rubrics USING GIN(grade_levels);
CREATE INDEX CONCURRENTLY idx_assessment_rubrics_usage ON assessment_rubrics(usage_count) WHERE usage_count > 0;

-- ================================================================
-- GAMIFICATION AND ENGAGEMENT INDEXES
-- ================================================================

-- XP and leveling
CREATE INDEX CONCURRENTLY idx_student_xp_level ON student_xp(level);
CREATE INDEX CONCURRENTLY idx_student_xp_total ON student_xp(total_xp);
CREATE INDEX CONCURRENTLY idx_xp_transactions_student_date ON xp_transactions(student_id, created_at);
CREATE INDEX CONCURRENTLY idx_xp_transactions_reason ON xp_transactions(reason);
CREATE INDEX CONCURRENTLY idx_xp_transactions_amount ON xp_transactions(amount) WHERE amount > 0;

-- Badges and achievements
CREATE INDEX CONCURRENTLY idx_badges_rarity ON badges(rarity) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_student_badges_student ON student_badges(student_id);
CREATE INDEX CONCURRENTLY idx_student_badges_badge ON student_badges(badge_id);
CREATE INDEX CONCURRENTLY idx_student_badges_earned_at ON student_badges(earned_at);
CREATE INDEX CONCURRENTLY idx_student_achievements_student_type ON student_achievements(student_id, achievement_type);
CREATE INDEX CONCURRENTLY idx_student_achievements_skill ON student_achievements(skill) WHERE skill IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_student_achievements_earned_at ON student_achievements(earned_at);

-- ================================================================
-- AI AND PERSONALIZATION INDEXES
-- ================================================================

-- AI character interactions
CREATE INDEX CONCURRENTLY idx_ai_interactions_student_character ON ai_character_interactions(student_id, character_id);
CREATE INDEX CONCURRENTLY idx_ai_interactions_type_date ON ai_character_interactions(interaction_type, created_at);
CREATE INDEX CONCURRENTLY idx_ai_interactions_rating ON ai_character_interactions(satisfaction_rating) WHERE satisfaction_rating IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_ai_interactions_duration ON ai_character_interactions(duration_seconds) WHERE duration_seconds IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_ai_interactions_cost ON ai_character_interactions(cost_cents) WHERE cost_cents > 0;

-- Personalization and recommendations
CREATE INDEX CONCURRENTLY idx_content_personalization_student ON content_personalization(student_id);
CREATE INDEX CONCURRENTLY idx_content_personalization_type ON content_personalization(content_type);
CREATE INDEX CONCURRENTLY idx_content_personalization_effectiveness ON content_personalization(effectiveness_score);
CREATE INDEX CONCURRENTLY idx_learning_recommendations_student_status ON learning_recommendations(student_id, status);
CREATE INDEX CONCURRENTLY idx_learning_recommendations_priority ON learning_recommendations(priority, generated_at);
CREATE INDEX CONCURRENTLY idx_learning_recommendations_expires ON learning_recommendations(expires_at) WHERE expires_at IS NOT NULL;

-- Student interactions
CREATE INDEX CONCURRENTLY idx_student_interactions_student_type ON student_interactions(student_id, interaction_type);
CREATE INDEX CONCURRENTLY idx_student_interactions_resolved ON student_interactions(resolved_at) WHERE resolved_at IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_student_interactions_created_at ON student_interactions(created_at);

-- Learning goals
CREATE INDEX CONCURRENTLY idx_learning_goals_student_status ON learning_goals(student_id, status);
CREATE INDEX CONCURRENTLY idx_learning_goals_target_date ON learning_goals(target_date) WHERE target_date IS NOT NULL;
CREATE INDEX CONCURRENTLY idx_learning_goals_progress ON learning_goals(progress_percentage);

-- ================================================================
-- AUDIT AND COMPLIANCE INDEXES
-- ================================================================

-- Profile audit log
CREATE INDEX CONCURRENTLY idx_profile_audit_student ON profile_audit_log(student_id);
CREATE INDEX CONCURRENTLY idx_profile_audit_changed_by ON profile_audit_log(changed_by);
CREATE INDEX CONCURRENTLY idx_profile_audit_action_date ON profile_audit_log(action, created_at);
CREATE INDEX CONCURRENTLY idx_profile_audit_date ON profile_audit_log(created_at);

-- Data export and deletion logs
CREATE INDEX CONCURRENTLY idx_data_export_student ON data_export_log(student_id);
CREATE INDEX CONCURRENTLY idx_data_export_requestor ON data_export_log(requestor_id);
CREATE INDEX CONCURRENTLY idx_data_export_date ON data_export_log(created_at);
CREATE INDEX CONCURRENTLY idx_data_deletion_student ON data_deletion_log(student_id);
CREATE INDEX CONCURRENTLY idx_data_deletion_deleted_by ON data_deletion_log(deleted_by);
CREATE INDEX CONCURRENTLY idx_data_deletion_date ON data_deletion_log(created_at);

-- ================================================================
-- SYSTEM CONFIGURATION INDEXES
-- ================================================================

-- System settings and feature flags
CREATE INDEX CONCURRENTLY idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX CONCURRENTLY idx_feature_flags_name ON feature_flags(flag_name);
CREATE INDEX CONCURRENTLY idx_feature_flags_enabled ON feature_flags(is_enabled) WHERE is_enabled = true;

-- API rate limiting
CREATE INDEX CONCURRENTLY idx_api_rate_limits_user_endpoint ON api_rate_limits(user_id, endpoint);
CREATE INDEX CONCURRENTLY idx_api_rate_limits_window ON api_rate_limits(window_start, window_end);

-- ================================================================
-- FULL-TEXT SEARCH INDEXES
-- ================================================================

-- Full-text search for content discovery
CREATE INDEX CONCURRENTLY idx_generated_content_title_trgm ON generated_content USING GIN(title gin_trgm_ops);
CREATE INDEX CONCURRENTLY idx_generated_content_description_trgm ON generated_content USING GIN(description gin_trgm_ops);
CREATE INDEX CONCURRENTLY idx_skills_topics_name_trgm ON skills_topics USING GIN(name gin_trgm_ops);
CREATE INDEX CONCURRENTLY idx_mastery_groups_name_trgm ON mastery_groups USING GIN(name gin_trgm_ops);
CREATE INDEX CONCURRENTLY idx_subjects_name_trgm ON subjects USING GIN(name gin_trgm_ops);

-- ================================================================
-- JSONB INDEXES FOR FLEXIBLE QUERIES
-- ================================================================

-- Learning preferences JSONB indexes
CREATE INDEX CONCURRENTLY idx_student_profiles_learning_prefs ON student_profiles USING GIN(learning_preferences);
CREATE INDEX CONCURRENTLY idx_student_profiles_accessibility ON student_profiles USING GIN(accessibility);
CREATE INDEX CONCURRENTLY idx_student_profiles_social_emotional ON student_profiles USING GIN(social_emotional);

-- Learning analytics metadata
CREATE INDEX CONCURRENTLY idx_learning_events_metadata ON learning_analytics_events USING GIN(metadata);
CREATE INDEX CONCURRENTLY idx_learning_events_learning_outcome ON learning_analytics_events USING GIN(learning_outcome);

-- Generated content metadata
CREATE INDEX CONCURRENTLY idx_generated_content_metadata ON generated_content USING GIN(metadata);
CREATE INDEX CONCURRENTLY idx_generated_content_ai_generation ON generated_content USING GIN(ai_generation);

-- Assessment and grading JSONB
CREATE INDEX CONCURRENTLY idx_assessments_questions ON assessments USING GIN(questions);
CREATE INDEX CONCURRENTLY idx_assessments_settings ON assessments USING GIN(settings);
CREATE INDEX CONCURRENTLY idx_assessment_submissions_responses ON assessment_submissions USING GIN(responses);
CREATE INDEX CONCURRENTLY idx_grading_results_scores ON grading_results USING GIN(scores);
CREATE INDEX CONCURRENTLY idx_grading_results_feedback ON grading_results USING GIN(feedback);

-- ================================================================
-- SPECIALIZED INDEXES FOR ANALYTICS QUERIES
-- ================================================================

-- Time-based analytics (optimized for date range queries)
CREATE INDEX CONCURRENTLY idx_learning_events_date_student ON learning_analytics_events(DATE(created_at), student_id);
CREATE INDEX CONCURRENTLY idx_learning_events_week_student ON learning_analytics_events(DATE_TRUNC('week', created_at), student_id);
CREATE INDEX CONCURRENTLY idx_learning_events_month_student ON learning_analytics_events(DATE_TRUNC('month', created_at), student_id);

-- Performance tracking indexes
CREATE INDEX CONCURRENTLY idx_student_progress_improvement ON student_progress(improvement_rate) WHERE improvement_rate > 0;
CREATE INDEX CONCURRENTLY idx_learning_outcomes_improvement ON learning_outcomes(improvement) WHERE improvement > 0;

-- Engagement metrics
CREATE INDEX CONCURRENTLY idx_ai_interactions_engagement ON ai_character_interactions(student_id, created_at, satisfaction_rating);
CREATE INDEX CONCURRENTLY idx_student_interactions_engagement ON student_interactions(student_id, created_at, interaction_type);

-- ================================================================
-- PARTIAL INDEXES FOR EFFICIENCY
-- ================================================================

-- Active records only (most common queries)
CREATE INDEX CONCURRENTLY idx_users_active_role ON users(role) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_student_profiles_active_grade ON student_profiles(grade_level) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_subjects_active_tenant ON subjects(tenant_id) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_generated_content_active_quality ON generated_content(quality_score) WHERE is_active = true AND quality_score >= 0.7;

-- Recent activity (last 30 days)
CREATE INDEX CONCURRENTLY idx_learning_events_recent ON learning_analytics_events(student_id, event_type) 
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days';
CREATE INDEX CONCURRENTLY idx_student_progress_recent_activity ON student_progress(student_id, subject) 
    WHERE last_activity_date >= CURRENT_DATE - INTERVAL '30 days';

-- High-value content
CREATE INDEX CONCURRENTLY idx_generated_content_high_usage ON generated_content(content_type, grade_level) 
    WHERE usage_count >= 10 AND is_active = true;

-- ================================================================
-- EXPRESSION INDEXES FOR COMPUTED VALUES
-- ================================================================

-- Computed age from date of birth
CREATE INDEX CONCURRENTLY idx_student_profiles_computed_age ON student_profiles(
    EXTRACT(YEAR FROM AGE(date_of_birth))
) WHERE date_of_birth IS NOT NULL AND is_active = true;

-- Learning velocity (progress per time)
CREATE INDEX CONCURRENTLY idx_student_progress_velocity ON student_progress(
    CASE WHEN time_spent_minutes > 0 THEN mastery_level / time_spent_minutes ELSE 0 END
) WHERE time_spent_minutes > 0;

-- Content freshness (days since creation)
CREATE INDEX CONCURRENTLY idx_generated_content_freshness ON generated_content(
    EXTRACT(DAYS FROM (CURRENT_TIMESTAMP - created_at))
) WHERE is_active = true;

-- ================================================================
-- PERFORMANCE OPTIMIZATION SETTINGS
-- ================================================================

-- Set optimal PostgreSQL settings for analytics workload
-- These would typically be set in postgresql.conf

-- Memory settings (commented as they're config file settings)
-- shared_buffers = 25% of RAM
-- effective_cache_size = 75% of RAM
-- work_mem = 4MB (for complex queries)
-- maintenance_work_mem = 2GB

-- Query optimization
-- random_page_cost = 1.1 (for SSD storage)
-- effective_io_concurrency = 200 (for SSD)
-- max_worker_processes = 8
-- max_parallel_workers_per_gather = 4

-- WAL and checkpointing (for write-heavy workloads)
-- wal_buffers = 16MB
-- checkpoint_completion_target = 0.9
-- wal_compression = on

-- ================================================================
-- STATISTICS AND MAINTENANCE
-- ================================================================

-- Create extended statistics for correlated columns
CREATE STATISTICS stats_student_grade_subject ON grade_level, subject FROM learning_analytics_events;
CREATE STATISTICS stats_content_type_difficulty ON content_type, difficulty FROM generated_content;
CREATE STATISTICS stats_assessment_grade_type ON grade_level, assessment_type FROM assessments;

-- Set statistics targets for heavily queried columns
ALTER TABLE learning_analytics_events ALTER COLUMN student_id SET STATISTICS 1000;
ALTER TABLE learning_analytics_events ALTER COLUMN created_at SET STATISTICS 1000;
ALTER TABLE student_profiles ALTER COLUMN grade_level SET STATISTICS 1000;
ALTER TABLE generated_content ALTER COLUMN quality_score SET STATISTICS 1000;

-- ================================================================
-- INDEX MONITORING VIEWS
-- ================================================================

-- Create view to monitor index usage
CREATE OR REPLACE VIEW index_usage_stats AS
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch,
    idx_scan,
    CASE 
        WHEN idx_scan = 0 THEN 'Never used'
        WHEN idx_scan < 100 THEN 'Low usage'
        WHEN idx_scan < 1000 THEN 'Medium usage'
        ELSE 'High usage'
    END AS usage_level
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Create view to monitor table sizes and index efficiency
CREATE OR REPLACE VIEW table_index_efficiency AS
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as index_size,
    ROUND(
        100.0 * pg_indexes_size(schemaname||'.'||tablename) / 
        NULLIF(pg_total_relation_size(schemaname||'.'||tablename), 0), 
        2
    ) as index_ratio_percent
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ================================================================
-- MAINTENANCE PROCEDURES
-- ================================================================

-- Function to rebuild statistics on all tables
CREATE OR REPLACE FUNCTION refresh_table_statistics()
RETURNS void AS $$
DECLARE
    table_name text;
BEGIN
    FOR table_name IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE 'ANALYZE ' || quote_ident(table_name);
        RAISE NOTICE 'Analyzed table: %', table_name;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to find unused indexes
CREATE OR REPLACE FUNCTION find_unused_indexes()
RETURNS TABLE(schema_name text, table_name text, index_name text, index_size text) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname::text,
        tablename::text,
        indexname::text,
        pg_size_pretty(pg_relation_size(schemaname||'.'||indexname))::text
    FROM pg_stat_user_indexes
    WHERE idx_scan = 0
    AND schemaname = 'public'
    ORDER BY pg_relation_size(schemaname||'.'||indexname) DESC;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- SUCCESS MESSAGE
-- ================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'PATHFINITY INDEXES & PERFORMANCE OPTIMIZATION COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total indexes created: %', (
        SELECT count(*) 
        FROM pg_indexes 
        WHERE schemaname = 'public'
    );
    RAISE NOTICE 'Performance features enabled:';
    RAISE NOTICE '  ✓ Composite indexes for complex queries';
    RAISE NOTICE '  ✓ Partial indexes for filtered data';
    RAISE NOTICE '  ✓ GIN indexes for JSONB and full-text search';
    RAISE NOTICE '  ✓ Expression indexes for computed values';
    RAISE NOTICE '  ✓ Statistics collection optimized';
    RAISE NOTICE '  ✓ Monitoring views created';
    RAISE NOTICE '  ✓ Maintenance procedures ready';
    RAISE NOTICE 'Database optimized for high-performance analytics!';
    RAISE NOTICE '========================================';
END $$;