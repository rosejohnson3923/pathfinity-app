-- ================================================================
-- PATHFINITY DATABASE SCHEMA - CORE TABLES
-- Production-ready database architecture for AI-native education platform
-- FERPA/COPPA compliant with advanced analytics support
-- ================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- ================================================================
-- ENUMS AND CUSTOM TYPES
-- ================================================================

-- Grade levels enum
CREATE TYPE grade_level AS ENUM (
    'PRE-K', 'K', '1', '2', '3', '4', '5', '6', 
    '7', '8', '9', '10', '11', '12'
);

-- Learning container types
CREATE TYPE container_type AS ENUM ('learn', 'experience', 'discover');

-- Assessment types
CREATE TYPE assessment_type AS ENUM ('diagnostic', 'formative', 'summative', 'adaptive');

-- Question types
CREATE TYPE question_type AS ENUM (
    'multiple-choice', 'true-false', 'fill-blank', 
    'short-answer', 'essay', 'interactive'
);

-- Learning event types
CREATE TYPE learning_event_type AS ENUM (
    'lesson_start', 'lesson_complete', 'assessment_submit',
    'skill_progress', 'achievement_earned', 'help_requested',
    'character_interaction', 'content_generated'
);

-- User roles
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'parent', 'admin', 'super_admin');

-- Learning styles
CREATE TYPE learning_style AS ENUM ('visual', 'auditory', 'kinesthetic', 'mixed');

-- Difficulty levels
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard', 'adaptive');

-- Content types
CREATE TYPE content_type AS ENUM (
    'lesson', 'practice', 'assessment', 'story', 'career_scenario'
);

-- ================================================================
-- CORE USER MANAGEMENT TABLES
-- ================================================================

-- Enhanced users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE, -- Links to Supabase auth.users
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    display_name VARCHAR(100),
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    date_of_birth DATE,
    phone VARCHAR(20),
    address JSONB,
    preferences JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    is_demo BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Districts table
CREATE TABLE districts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(20) UNIQUE,
    state VARCHAR(2),
    country VARCHAR(2) DEFAULT 'US',
    superintendent_id UUID REFERENCES users(id),
    settings JSONB DEFAULT '{}',
    contact_info JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Schools table
CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district_id UUID REFERENCES districts(id),
    name VARCHAR(200) NOT NULL,
    code VARCHAR(20),
    principal_id UUID REFERENCES users(id),
    address JSONB,
    contact_info JSONB,
    grade_levels grade_level[] DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(district_id, code)
);

-- Classes table
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id),
    teacher_id UUID REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    subject VARCHAR(50),
    grade_level grade_level NOT NULL,
    capacity INTEGER DEFAULT 30,
    enrollment_count INTEGER DEFAULT 0,
    academic_year VARCHAR(10), -- e.g., "2024-2025"
    semester VARCHAR(20), -- e.g., "Fall", "Spring"
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Class enrollments (many-to-many)
CREATE TABLE class_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    withdrawal_date DATE,
    status VARCHAR(20) DEFAULT 'active', -- active, withdrawn, transferred
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(class_id, student_id)
);

-- ================================================================
-- STUDENT PROFILE TABLES
-- ================================================================

-- Comprehensive student profiles
CREATE TABLE student_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id), -- For backward compatibility
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    grade_level grade_level NOT NULL,
    date_of_birth DATE,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    graduation_year INTEGER,
    
    -- Academic information
    academic_info JSONB DEFAULT '{}',
    
    -- Learning preferences
    learning_preferences JSONB DEFAULT '{}',
    learning_style learning_style DEFAULT 'mixed',
    
    -- Accessibility and accommodations
    accessibility JSONB DEFAULT '{}',
    has_iep BOOLEAN DEFAULT false,
    has_504_plan BOOLEAN DEFAULT false,
    accommodations JSONB DEFAULT '{}',
    
    -- Social-emotional data
    social_emotional JSONB DEFAULT '{}',
    
    -- Parent/Guardian information
    parent_guardian_info JSONB DEFAULT '{}',
    parent_email VARCHAR(255),
    
    -- Privacy settings
    privacy_settings JSONB DEFAULT '{}',
    
    -- Compliance flags
    ferpa_compliant BOOLEAN DEFAULT true,
    coppa_compliant BOOLEAN DEFAULT true,
    
    -- System metadata
    school_id UUID REFERENCES schools(id),
    metadata JSONB DEFAULT '{}',
    data_version VARCHAR(10) DEFAULT '1.0.0',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(student_id),
    UNIQUE(user_id) -- For backward compatibility
);

-- Student interactions tracking
CREATE TABLE student_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interaction_id UUID UNIQUE DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL, -- help_request, feedback_provided, etc.
    context JSONB DEFAULT '{}',
    content JSONB,
    resolved_at TIMESTAMP WITH TIME ZONE,
    response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Learning goals
CREATE TABLE learning_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    goal_id UUID UNIQUE DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    target_date DATE,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    status VARCHAR(20) DEFAULT 'active', -- active, completed, paused
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Student achievements
CREATE TABLE student_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_type VARCHAR(50) NOT NULL, -- skill_mastery, streak, improvement, completion
    skill VARCHAR(100),
    description TEXT,
    points_earned INTEGER DEFAULT 0,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

-- ================================================================
-- CURRICULUM AND CONTENT TABLES
-- ================================================================

-- Subjects
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    description TEXT,
    color VARCHAR(7), -- Hex color code
    icon VARCHAR(50),
    grade_levels grade_level[] DEFAULT '{}',
    standards JSONB DEFAULT '{}', -- Education standards alignment
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Mastery groups (skill groupings)
CREATE TABLE mastery_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    grade_level grade_level NOT NULL,
    sequence_order INTEGER DEFAULT 0,
    prerequisites UUID[] DEFAULT '{}', -- Array of mastery group IDs
    estimated_duration_hours INTEGER DEFAULT 10,
    standards_alignment JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Skills/Topics within mastery groups
CREATE TABLE skills_topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID,
    mastery_group_id UUID REFERENCES mastery_groups(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    learning_objectives JSONB DEFAULT '[]',
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 10),
    estimated_duration_minutes INTEGER DEFAULT 30,
    sequence_order INTEGER DEFAULT 0,
    prerequisites UUID[] DEFAULT '{}', -- Array of skill IDs
    standards_alignment JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Generated content storage
CREATE TABLE generated_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID UNIQUE DEFAULT uuid_generate_v4(),
    content_type content_type NOT NULL,
    title VARCHAR(300),
    description TEXT,
    content_data JSONB NOT NULL,
    metadata JSONB DEFAULT '{}',
    ai_generation JSONB DEFAULT '{}', -- AI generation details
    grade_level grade_level,
    subject VARCHAR(100),
    skill VARCHAR(100),
    difficulty difficulty_level DEFAULT 'medium',
    estimated_duration INTEGER DEFAULT 15, -- minutes
    quality_score DECIMAL(3,2) DEFAULT 0.0, -- 0.00 to 1.00
    safety_validated BOOLEAN DEFAULT false,
    coppa_compliant BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Content templates
CREATE TABLE content_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID UNIQUE DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    content_type content_type NOT NULL,
    grade_range grade_level[] DEFAULT '{}',
    subjects VARCHAR(100)[] DEFAULT '{}',
    structure JSONB NOT NULL,
    metadata JSONB DEFAULT '{}',
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- ASSESSMENT TABLES
-- ================================================================

-- Assessments
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID UNIQUE DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(300),
    assessment_type assessment_type NOT NULL,
    grade_level grade_level NOT NULL,
    subject VARCHAR(100),
    skill VARCHAR(100),
    questions JSONB NOT NULL, -- Array of question objects
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    time_limit_minutes INTEGER,
    passing_score INTEGER DEFAULT 70,
    max_attempts INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'created', -- created, in-progress, submitted, graded
    scheduled_for TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Assessment submissions
CREATE TABLE assessment_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID UNIQUE DEFAULT uuid_generate_v4(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    responses JSONB NOT NULL, -- Array of student responses
    start_time TIMESTAMP WITH TIME ZONE,
    submit_time TIMESTAMP WITH TIME ZONE,
    total_time_spent INTEGER, -- seconds
    attempt_number INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'submitted', -- submitted, grading, graded
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Grading results
CREATE TABLE grading_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID REFERENCES assessment_submissions(id) ON DELETE CASCADE,
    assessment_id UUID REFERENCES assessments(id),
    student_id UUID REFERENCES users(id),
    scores JSONB NOT NULL, -- Overall scores
    question_results JSONB NOT NULL, -- Individual question results
    skill_analysis JSONB DEFAULT '{}',
    feedback JSONB DEFAULT '{}',
    ai_insights JSONB,
    quality_metrics JSONB DEFAULT '{}',
    graded_by VARCHAR(50) DEFAULT 'ai', -- ai, teacher, peer
    graded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    is_final BOOLEAN DEFAULT true
);

-- Rubrics for assessment
CREATE TABLE assessment_rubrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rubric_id UUID UNIQUE DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    subject VARCHAR(100),
    grade_levels grade_level[] DEFAULT '{}',
    criteria JSONB NOT NULL, -- Rubric criteria and scoring levels
    total_points INTEGER NOT NULL,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- LEARNING ANALYTICS TABLES
-- ================================================================

-- Learning analytics events
CREATE TABLE learning_analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID UNIQUE DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID NOT NULL,
    event_type learning_event_type NOT NULL,
    
    -- Event metadata
    metadata JSONB DEFAULT '{}',
    grade VARCHAR(10),
    subject VARCHAR(100),
    skill VARCHAR(100),
    container container_type,
    character_id VARCHAR(50),
    duration INTEGER, -- seconds
    accuracy DECIMAL(5,2), -- percentage
    attempts INTEGER DEFAULT 1,
    difficulty_level difficulty_level,
    
    -- Learning outcomes
    learning_outcome JSONB,
    mastery_score DECIMAL(5,2), -- 0-100
    improvement_score DECIMAL(5,2), -- -100 to 100
    confidence_score DECIMAL(5,2), -- 0-100
    
    -- System metadata
    user_agent TEXT,
    ip_address INET,
    device_info JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Partitioning key for performance
    CONSTRAINT learning_analytics_events_date_check 
        CHECK (created_at >= '2024-01-01'::date)
) PARTITION BY RANGE (created_at);

-- Create monthly partitions for learning analytics (example for 2024-2025)
CREATE TABLE learning_analytics_events_2024_01 PARTITION OF learning_analytics_events 
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE learning_analytics_events_2024_02 PARTITION OF learning_analytics_events 
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
CREATE TABLE learning_analytics_events_2024_03 PARTITION OF learning_analytics_events 
    FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');
-- Add more partitions as needed...

-- Student progress tracking
CREATE TABLE student_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(100),
    skill VARCHAR(100),
    mastery_level DECIMAL(5,2) DEFAULT 0, -- 0-100
    attempts INTEGER DEFAULT 0,
    time_spent_minutes INTEGER DEFAULT 0,
    last_activity_date DATE DEFAULT CURRENT_DATE,
    streak_days INTEGER DEFAULT 0,
    best_score DECIMAL(5,2) DEFAULT 0,
    improvement_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, subject, skill)
);

-- Learning outcomes tracking
CREATE TABLE learning_outcomes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES learning_analytics_events(id),
    mastery DECIMAL(5,2) NOT NULL, -- 0-100
    improvement DECIMAL(5,2) NOT NULL, -- -100 to 100
    confidence DECIMAL(5,2) NOT NULL, -- 0-100
    skill VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- GAMIFICATION TABLES
-- ================================================================

-- XP (Experience Points) tracking
CREATE TABLE student_xp (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    total_xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    xp_to_next_level INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id)
);

-- XP transactions log
CREATE TABLE xp_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    event_id UUID, -- Links to learning event if applicable
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Badges and achievements
CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_url VARCHAR(500),
    requirements JSONB NOT NULL, -- Criteria for earning the badge
    rarity VARCHAR(20) DEFAULT 'common', -- common, uncommon, rare, epic, legendary
    points INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Student badges (earned badges)
CREATE TABLE student_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES badges(id),
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    progress JSONB DEFAULT '{}', -- Progress towards badge if partially earned
    metadata JSONB DEFAULT '{}',
    UNIQUE(student_id, badge_id)
);

-- ================================================================
-- AI AND PERSONALIZATION TABLES
-- ================================================================

-- AI character interactions
CREATE TABLE ai_character_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    character_id VARCHAR(50) NOT NULL, -- finn, sage, spark, harmony
    interaction_type VARCHAR(50) NOT NULL,
    prompt TEXT,
    response TEXT,
    context JSONB DEFAULT '{}',
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    duration_seconds INTEGER,
    tokens_used INTEGER,
    cost_cents INTEGER, -- Track API costs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Content personalization
CREATE TABLE content_personalization (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content_type VARCHAR(50),
    preferences JSONB DEFAULT '{}',
    effectiveness_score DECIMAL(3,2) DEFAULT 0.5, -- 0.00 to 1.00
    usage_count INTEGER DEFAULT 0,
    last_used TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, content_type)
);

-- Learning recommendations
CREATE TABLE learning_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(50) NOT NULL, -- skill_practice, review, advancement, etc.
    priority VARCHAR(20) DEFAULT 'medium', -- high, medium, low
    title VARCHAR(200),
    description TEXT,
    estimated_time_minutes INTEGER,
    resources JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, dismissed, completed
    generated_by VARCHAR(50) DEFAULT 'ai', -- ai, teacher, system
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    acted_on_at TIMESTAMP WITH TIME ZONE
);

-- ================================================================
-- AUDIT AND COMPLIANCE TABLES
-- ================================================================

-- Profile audit log for FERPA compliance
CREATE TABLE profile_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id),
    changed_by UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL, -- created, updated, deleted, viewed
    changes JSONB,
    old_version VARCHAR(10),
    new_version VARCHAR(10),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Data export log
CREATE TABLE data_export_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id),
    requestor_id UUID REFERENCES users(id),
    requestor_role user_role,
    export_type VARCHAR(50),
    data_exported JSONB,
    export_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Data deletion log
CREATE TABLE data_deletion_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID,
    deleted_by UUID REFERENCES users(id),
    deletion_reason VARCHAR(100),
    data_summary JSONB,
    retention_override BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================================================================
-- SYSTEM CONFIGURATION TABLES
-- ================================================================

-- System settings
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB,
    description TEXT,
    is_encrypted BOOLEAN DEFAULT false,
    last_modified_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Feature flags
CREATE TABLE feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flag_name VARCHAR(100) UNIQUE NOT NULL,
    is_enabled BOOLEAN DEFAULT false,
    description TEXT,
    target_audience JSONB DEFAULT '{}', -- grades, roles, schools, etc.
    rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- API rate limiting
CREATE TABLE api_rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    endpoint VARCHAR(200),
    requests_made INTEGER DEFAULT 0,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    window_end TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, endpoint, window_start)
);

-- ================================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ================================================================

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables that need updated_at maintenance
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_districts_updated_at BEFORE UPDATE ON districts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON schools FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_student_profiles_updated_at BEFORE UPDATE ON student_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_goals_updated_at BEFORE UPDATE ON learning_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mastery_groups_updated_at BEFORE UPDATE ON mastery_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_skills_topics_updated_at BEFORE UPDATE ON skills_topics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_generated_content_updated_at BEFORE UPDATE ON generated_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_templates_updated_at BEFORE UPDATE ON content_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_student_progress_updated_at BEFORE UPDATE ON student_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_student_xp_updated_at BEFORE UPDATE ON student_xp FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_content_personalization_updated_at BEFORE UPDATE ON content_personalization FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON feature_flags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- COMMENTS FOR DOCUMENTATION
-- ================================================================

COMMENT ON TABLE users IS 'Enhanced user management extending Supabase auth with additional profile data';
COMMENT ON TABLE student_profiles IS 'Comprehensive student profiles with FERPA/COPPA compliance';
COMMENT ON TABLE learning_analytics_events IS 'Partitioned table for high-volume learning event tracking';
COMMENT ON TABLE generated_content IS 'AI-generated educational content with quality metrics';
COMMENT ON TABLE assessments IS 'Adaptive assessments with AI-powered grading support';
COMMENT ON TABLE student_progress IS 'Real-time student progress tracking across subjects and skills';
COMMENT ON TABLE ai_character_interactions IS 'Tracks interactions with AI characters (Finn, Sage, Spark, Harmony)';
COMMENT ON TABLE profile_audit_log IS 'FERPA-compliant audit log for all profile changes';

-- Add table and column comments for better documentation
COMMENT ON COLUMN student_profiles.ferpa_compliant IS 'Indicates if profile meets FERPA compliance requirements';
COMMENT ON COLUMN student_profiles.coppa_compliant IS 'Indicates if profile meets COPPA compliance requirements (under 13)';
COMMENT ON COLUMN learning_analytics_events.mastery_score IS 'Student mastery level for the skill (0-100)';
COMMENT ON COLUMN learning_analytics_events.improvement_score IS 'Improvement over previous attempts (-100 to 100)';
COMMENT ON COLUMN generated_content.quality_score IS 'AI-assessed content quality score (0.00 to 1.00)';
COMMENT ON COLUMN assessments.assessment_type IS 'Type of assessment: diagnostic, formative, summative, or adaptive';

-- ================================================================
-- SUCCESS MESSAGE
-- ================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'PATHFINITY DATABASE SCHEMA DEPLOYED';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Core tables created successfully!';
    RAISE NOTICE 'Total tables: %', (
        SELECT count(*) 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
    );
    RAISE NOTICE 'Extensions enabled: uuid-ossp, pgcrypto, pg_trgm, btree_gin';
    RAISE NOTICE 'Partitioning configured for learning_analytics_events';
    RAISE NOTICE 'FERPA/COPPA compliance features enabled';
    RAISE NOTICE 'Ready for microservices integration!';
    RAISE NOTICE '========================================';
END $$;