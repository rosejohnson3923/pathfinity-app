-- ================================================================
-- INTELLIGENT TESTBED DATABASE SCHEMA
-- Migration: 20250711_intelligent_testbed_schema.sql
-- Description: Comprehensive content and analytics system for Teacher/Admin dashboards
-- ================================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- 1. PRE-GENERATED EDUCATIONAL CONTENT TABLES
-- Stores all AI-generated content for consistent testing
-- ================================================================

-- Master content table for all learning materials
CREATE TABLE learning_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_type TEXT NOT NULL CHECK (content_type IN ('instruction', 'practice', 'assessment', 'career_scenario', 'narrative')),
    subject TEXT NOT NULL CHECK (subject IN ('Math', 'Science', 'ELA', 'Social Studies')),
    grade_level TEXT NOT NULL CHECK (grade_level IN ('Pre-K', 'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12')),
    skill_code TEXT NOT NULL, -- Links to existing skills_master
    learning_container TEXT NOT NULL CHECK (learning_container IN ('learn', 'experience', 'discover')),
    
    -- Content data
    title TEXT NOT NULL,
    content_data JSONB NOT NULL, -- Flexible storage for different content types
    difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 10),
    estimated_duration_minutes INTEGER CHECK (estimated_duration_minutes > 0),
    
    -- Career-specific data (for Experience/Discover modes)
    career_id TEXT,
    career_context TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Analytics tags for dashboard filtering
    tags TEXT[], -- ["visual_learner", "high_engagement", "collaboration", etc.]
    complexity_factors JSONB -- {"reading_level": 3, "math_operations": 2, "abstract_thinking": 1}
);

-- Question bank with validated answers for all assessments
CREATE TABLE assessment_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID NOT NULL REFERENCES learning_content(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'fill_blank', 'drag_drop', 'drawing')),
    
    -- Answer validation
    correct_answer TEXT NOT NULL,
    answer_options JSONB, -- For multiple choice options
    explanation TEXT,
    
    -- Learning context
    learning_container TEXT NOT NULL CHECK (learning_container IN ('learn', 'experience', 'discover')),
    skill_code TEXT NOT NULL,
    
    -- Analytics data
    question_difficulty DECIMAL(3,2) CHECK (question_difficulty >= 0.0 AND question_difficulty <= 1.0),
    average_time_seconds INTEGER,
    success_rate DECIMAL(3,2) CHECK (success_rate >= 0.0 AND success_rate <= 1.0),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Career scenarios for Experience mode
CREATE TABLE career_scenarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    career_id TEXT NOT NULL,
    career_name TEXT NOT NULL,
    department TEXT NOT NULL,
    grade_level TEXT NOT NULL,
    
    -- Scenario content
    scenario_title TEXT NOT NULL,
    scenario_description TEXT NOT NULL,
    real_world_context TEXT NOT NULL,
    tasks JSONB NOT NULL, -- Array of tasks with skills mapping
    
    -- Skills integration
    applicable_skills TEXT[], -- Array of skill codes
    primary_subject TEXT NOT NULL,
    cross_curricular_subjects TEXT[],
    
    -- Analytics metadata
    engagement_level TEXT CHECK (engagement_level IN ('low', 'medium', 'high')),
    collaboration_required BOOLEAN DEFAULT FALSE,
    estimated_completion_minutes INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- 2. ENHANCED LEARNING ANALYTICS TABLES
-- Detailed tracking for Teacher/Admin dashboards
-- ================================================================

-- Comprehensive session tracking across all containers
CREATE TABLE learning_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_type TEXT NOT NULL CHECK (session_type IN ('learn', 'experience', 'discover', 'assessment')),
    
    -- Session details
    assignment_id UUID, -- Links to daily_assignments if applicable
    content_id UUID REFERENCES learning_content(id),
    career_id TEXT, -- For Experience/Discover modes
    
    -- Timing data
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    total_duration_seconds INTEGER,
    active_engagement_seconds INTEGER, -- Time actively interacting
    idle_time_seconds INTEGER,
    
    -- Completion status
    completion_status TEXT CHECK (completion_status IN ('in_progress', 'completed', 'abandoned', 'interrupted')),
    completion_percentage DECIMAL(5,2) CHECK (completion_percentage >= 0.0 AND completion_percentage <= 100.0),
    
    -- Performance metrics
    questions_attempted INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    score DECIMAL(5,2) CHECK (score >= 0.0 AND score <= 100.0),
    
    -- Learning context analysis
    learning_context_preference TEXT, -- 'abstract', 'applied', 'narrative'
    help_requests_count INTEGER DEFAULT 0,
    hint_usage_count INTEGER DEFAULT 0,
    retry_attempts INTEGER DEFAULT 0,
    
    -- Engagement indicators
    engagement_score DECIMAL(3,2) CHECK (engagement_score >= 0.0 AND engagement_score <= 1.0),
    frustration_indicators INTEGER DEFAULT 0, -- Rapid clicks, backtracking, etc.
    excitement_indicators INTEGER DEFAULT 0, -- Extended voluntary time, exploration, etc.
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Detailed question attempt tracking for assessment analysis
CREATE TABLE question_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES learning_sessions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES assessment_questions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Attempt details
    attempt_number INTEGER NOT NULL DEFAULT 1,
    student_answer TEXT,
    is_correct BOOLEAN NOT NULL,
    time_spent_seconds INTEGER NOT NULL,
    
    -- Learning analysis
    learning_container TEXT NOT NULL,
    skill_code TEXT NOT NULL,
    confidence_level TEXT CHECK (confidence_level IN ('low', 'medium', 'high')),
    
    -- Context tracking
    hints_used INTEGER DEFAULT 0,
    resources_accessed TEXT[], -- Which help resources were used
    peer_collaboration BOOLEAN DEFAULT FALSE,
    
    -- Timing analysis
    first_interaction_seconds INTEGER, -- Time to first click/input
    final_submission_seconds INTEGER, -- Time to final submit
    revision_count INTEGER DEFAULT 0, -- How many times they changed their answer
    
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning preference analysis for personalization
CREATE TABLE student_learning_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Learning style identification
    preferred_learning_context TEXT, -- 'abstract', 'applied', 'narrative'
    visual_learning_score DECIMAL(3,2) CHECK (visual_learning_score >= 0.0 AND visual_learning_score <= 1.0),
    auditory_learning_score DECIMAL(3,2) CHECK (auditory_learning_score >= 0.0 AND auditory_learning_score <= 1.0),
    kinesthetic_learning_score DECIMAL(3,2) CHECK (kinesthetic_learning_score >= 0.0 AND kinesthetic_learning_score <= 1.0),
    
    -- Subject performance patterns
    math_proficiency_trend JSONB, -- Time series data
    science_proficiency_trend JSONB,
    ela_proficiency_trend JSONB,
    
    -- Engagement patterns
    optimal_session_length_minutes INTEGER,
    preferred_difficulty_progression TEXT CHECK (preferred_difficulty_progression IN ('gradual', 'mixed', 'challenging')),
    collaboration_preference DECIMAL(3,2) CHECK (collaboration_preference >= 0.0 AND collaboration_preference <= 1.0),
    
    -- Career exploration insights
    career_interests JSONB, -- {"engineering": 0.8, "healthcare": 0.6, "arts": 0.4}
    career_exploration_breadth DECIMAL(3,2), -- How many different careers explored
    career_depth_preference DECIMAL(3,2), -- Prefers deep dive vs broad exploration
    
    -- Intervention triggers
    help_seeking_frequency DECIMAL(3,2),
    frustration_tolerance DECIMAL(3,2),
    persistence_score DECIMAL(3,2),
    
    -- Performance predictors
    mastery_velocity DECIMAL(5,2), -- Skills mastered per hour
    retention_rate DECIMAL(3,2), -- How well they retain learned concepts
    transfer_ability DECIMAL(3,2), -- Apply learning to new contexts
    
    last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(student_id)
);

-- ================================================================
-- 3. TEACHER & ADMIN DASHBOARD VIEWS
-- Pre-calculated views for dashboard performance
-- ================================================================

-- Teacher: Student progress overview
CREATE VIEW teacher_student_overview AS
SELECT 
    sp.display_name,
    sp.grade_level,
    sla.preferred_learning_context,
    sla.mastery_velocity,
    
    -- Recent performance
    COUNT(CASE WHEN ls.started_at >= NOW() - INTERVAL '7 days' THEN 1 END) as sessions_last_week,
    AVG(CASE WHEN ls.started_at >= NOW() - INTERVAL '7 days' THEN ls.score END) as avg_score_last_week,
    SUM(CASE WHEN ls.started_at >= NOW() - INTERVAL '7 days' THEN ls.total_duration_seconds END) / 60 as minutes_last_week,
    
    -- Learning preferences
    sla.visual_learning_score,
    sla.auditory_learning_score,
    sla.kinesthetic_learning_score,
    
    -- Engagement indicators
    AVG(ls.engagement_score) as avg_engagement,
    sla.help_seeking_frequency,
    sla.persistence_score,
    
    -- Career exploration
    sla.career_interests,
    sla.career_exploration_breadth
    
FROM student_profiles sp
LEFT JOIN student_learning_analytics sla ON sp.user_id = sla.student_id
LEFT JOIN learning_sessions ls ON sp.user_id = ls.student_id
WHERE sp.is_active = TRUE
GROUP BY sp.user_id, sp.display_name, sp.grade_level, sla.preferred_learning_context, 
         sla.mastery_velocity, sla.visual_learning_score, sla.auditory_learning_score, 
         sla.kinesthetic_learning_score, sla.help_seeking_frequency, sla.persistence_score,
         sla.career_interests, sla.career_exploration_breadth;

-- Admin: School performance metrics
CREATE VIEW admin_school_metrics AS
SELECT 
    sp.grade_level,
    COUNT(DISTINCT sp.user_id) as total_students,
    
    -- Academic performance
    AVG(sla.mastery_velocity) as avg_mastery_velocity,
    AVG(sla.retention_rate) as avg_retention_rate,
    
    -- Engagement metrics
    AVG(ls.engagement_score) as avg_engagement_score,
    AVG(ls.total_duration_seconds) / 60 as avg_session_minutes,
    
    -- Learning effectiveness
    AVG(CASE WHEN qa.is_correct THEN 1.0 ELSE 0.0 END) as overall_success_rate,
    
    -- Container effectiveness
    AVG(CASE WHEN ls.session_type = 'learn' THEN ls.score END) as learn_effectiveness,
    AVG(CASE WHEN ls.session_type = 'experience' THEN ls.score END) as experience_effectiveness,
    AVG(CASE WHEN ls.session_type = 'discover' THEN ls.score END) as discover_effectiveness,
    
    -- Resource utilization
    COUNT(DISTINCT ls.content_id) as unique_content_used,
    COUNT(DISTINCT ls.career_id) as careers_explored,
    
    -- Intervention needs
    COUNT(CASE WHEN sla.help_seeking_frequency > 0.7 THEN 1 END) as high_support_students,
    COUNT(CASE WHEN sla.frustration_tolerance < 0.3 THEN 1 END) as at_risk_students
    
FROM student_profiles sp
LEFT JOIN student_learning_analytics sla ON sp.user_id = sla.student_id
LEFT JOIN learning_sessions ls ON sp.user_id = ls.student_id
LEFT JOIN question_attempts qa ON sp.user_id = qa.student_id
WHERE sp.is_active = TRUE
GROUP BY sp.grade_level;

-- ================================================================
-- 4. PERFORMANCE INDEXES FOR DASHBOARD QUERIES
-- ================================================================

-- Learning content indexes
CREATE INDEX idx_learning_content_container_grade ON learning_content(learning_container, grade_level);
CREATE INDEX idx_learning_content_subject_skill ON learning_content(subject, skill_code);
CREATE INDEX idx_learning_content_career ON learning_content(career_id) WHERE career_id IS NOT NULL;

-- Session tracking indexes
CREATE INDEX idx_learning_sessions_student_date ON learning_sessions(student_id, started_at);
CREATE INDEX idx_learning_sessions_type_grade ON learning_sessions(session_type, started_at);
CREATE INDEX idx_learning_sessions_engagement ON learning_sessions(engagement_score, completion_status);

-- Question attempts indexes
CREATE INDEX idx_question_attempts_student_skill ON question_attempts(student_id, skill_code, attempted_at);
CREATE INDEX idx_question_attempts_session_correct ON question_attempts(session_id, is_correct);
CREATE INDEX idx_question_attempts_container_time ON question_attempts(learning_container, time_spent_seconds);

-- Analytics indexes
CREATE INDEX idx_student_learning_analytics_updated ON student_learning_analytics(last_calculated_at);
CREATE INDEX idx_student_learning_analytics_performance ON student_learning_analytics(mastery_velocity, retention_rate);

-- ================================================================
-- 5. ROW LEVEL SECURITY POLICIES
-- ================================================================

-- Enable RLS on all new tables
ALTER TABLE learning_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_learning_analytics ENABLE ROW LEVEL SECURITY;

-- Content access policies (read-only for authenticated users)
CREATE POLICY "learning_content_read_access" ON learning_content
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "assessment_questions_read_access" ON assessment_questions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "career_scenarios_read_access" ON career_scenarios
    FOR SELECT USING (auth.role() = 'authenticated');

-- Analytics policies (students can only see their own data)
CREATE POLICY "learning_sessions_student_access" ON learning_sessions
    FOR ALL USING (auth.uid() = student_id);

CREATE POLICY "question_attempts_student_access" ON question_attempts
    FOR ALL USING (auth.uid() = student_id);

CREATE POLICY "student_analytics_self_access" ON student_learning_analytics
    FOR ALL USING (auth.uid() = student_id);

-- Teacher access policies (can see all students in their classes)
-- Note: This would need to be expanded with teacher-student relationships
CREATE POLICY "learning_sessions_teacher_access" ON learning_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.uid() = id 
            AND raw_user_meta_data->>'role' IN ('teacher', 'admin')
        )
    );

-- Admin full access policies
CREATE POLICY "admin_full_analytics_access" ON learning_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.uid() = id 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- ================================================================
-- 6. TRIGGERS AND FUNCTIONS
-- ================================================================

-- Update timestamps
CREATE TRIGGER update_learning_content_updated_at BEFORE UPDATE ON learning_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_sessions_updated_at BEFORE UPDATE ON learning_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_learning_analytics_updated_at BEFORE UPDATE ON student_learning_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate engagement score based on session data
CREATE OR REPLACE FUNCTION calculate_engagement_score(
    total_duration INTEGER,
    active_engagement INTEGER,
    completion_percentage DECIMAL,
    help_requests INTEGER,
    frustration_indicators INTEGER,
    excitement_indicators INTEGER
) RETURNS DECIMAL(3,2) AS $$
DECLARE
    engagement_score DECIMAL(3,2);
    active_ratio DECIMAL(3,2);
BEGIN
    -- Calculate active engagement ratio
    active_ratio := CASE 
        WHEN total_duration > 0 THEN active_engagement::DECIMAL / total_duration::DECIMAL
        ELSE 0.0
    END;
    
    -- Base score from completion and active engagement
    engagement_score := (completion_percentage / 100.0 * 0.4) + (active_ratio * 0.4);
    
    -- Adjust for help seeking (moderate help seeking is positive)
    IF help_requests BETWEEN 1 AND 3 THEN
        engagement_score := engagement_score + 0.1;
    ELSIF help_requests > 5 THEN
        engagement_score := engagement_score - 0.1;
    END IF;
    
    -- Adjust for frustration (negative impact)
    engagement_score := engagement_score - (frustration_indicators * 0.05);
    
    -- Boost for excitement indicators
    engagement_score := engagement_score + (excitement_indicators * 0.1);
    
    -- Ensure score is between 0.0 and 1.0
    engagement_score := GREATEST(0.0, LEAST(1.0, engagement_score));
    
    RETURN engagement_score;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================

COMMENT ON TABLE learning_content IS 'Pre-generated educational content for consistent testing and analytics';
COMMENT ON TABLE learning_sessions IS 'Comprehensive session tracking for Teacher/Admin dashboard insights';
COMMENT ON TABLE student_learning_analytics IS 'Calculated learning preferences and performance predictors for personalization';
COMMENT ON VIEW teacher_student_overview IS 'Teacher dashboard view showing student progress and learning preferences';
COMMENT ON VIEW admin_school_metrics IS 'Admin dashboard view with school-wide performance and engagement metrics';

SELECT 'Intelligent Testbed Schema Migration Completed Successfully' as migration_status;