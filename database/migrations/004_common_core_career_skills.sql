-- ============================================
-- Common Core Career-Aligned Skills Database Schema
-- ============================================
-- This migration creates tables for storing Common Core standards
-- mapped to career paths for high school students (Grades 9-12)

-- 1. Common Core Standards Master Table
CREATE TABLE IF NOT EXISTS common_core_standards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Common Core Identity
    common_core_id VARCHAR(20) NOT NULL UNIQUE, -- e.g., "HSN-RN.A.1"
    common_core_description TEXT NOT NULL,
    
    -- Standard Classification
    subject VARCHAR(50) NOT NULL, -- Math, ELA
    grade VARCHAR(10) NOT NULL, -- 9, 10, 11, 12
    skills_area TEXT NOT NULL, -- e.g., "Number and Quantity", "Algebra"
    skills_cluster TEXT NOT NULL, -- e.g., "The Real Number System"
    skill_number VARCHAR(20) NOT NULL, -- Same as common_core_id for consistency
    skill_name TEXT NOT NULL, -- Brief name like "Rational exponents and properties"
    
    -- Additional Metadata
    domain_code VARCHAR(10), -- e.g., "HSN", "HSA", "RST"
    cluster_code VARCHAR(10), -- e.g., "RN", "SSE", "9-10"
    standard_level VARCHAR(20), -- e.g., "A.1", "B.2.a"
    cognitive_level VARCHAR(50), -- Bloom's: Remember, Understand, Apply, Analyze, Evaluate, Create
    
    -- Prerequisites and Dependencies
    prerequisite_standards TEXT[], -- Array of common_core_ids
    corequisite_standards TEXT[], -- Standards that should be learned together
    
    -- Difficulty and Time
    difficulty_level INTEGER DEFAULT 3 CHECK (difficulty_level BETWEEN 1 AND 5),
    estimated_time_hours DECIMAL(4,2), -- Hours to master
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_essential BOOLEAN DEFAULT TRUE, -- Core vs supplementary
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Career Paths Table
CREATE TABLE IF NOT EXISTS career_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Career Identity
    career_code VARCHAR(50) NOT NULL UNIQUE,
    career_name TEXT NOT NULL,
    career_category VARCHAR(100) NOT NULL, -- STEM, Business, Healthcare, etc.
    
    -- Career Details
    description TEXT,
    typical_education VARCHAR(100), -- HS Diploma, Bachelor's, Master's, etc.
    growth_outlook VARCHAR(50), -- Declining, Stable, Growing, High Growth
    median_salary_range VARCHAR(50), -- e.g., "$50,000-$75,000"
    
    -- Skills Requirements
    essential_skills_count INTEGER DEFAULT 0,
    recommended_skills_count INTEGER DEFAULT 0,
    
    -- Industry Information
    industry_sectors TEXT[],
    work_environments TEXT[], -- Office, Remote, Field, Laboratory, etc.
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_trending BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Career-Standard Mapping (Many-to-Many)
CREATE TABLE IF NOT EXISTS career_standard_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign Keys
    career_code VARCHAR(50) NOT NULL,
    common_core_id VARCHAR(20) NOT NULL REFERENCES common_core_standards(common_core_id),
    
    -- Relationship Type
    relevance_level VARCHAR(20) NOT NULL, -- Essential, Recommended, Optional
    relevance_score INTEGER DEFAULT 5 CHECK (relevance_score BETWEEN 1 AND 10),
    
    -- Context
    application_context TEXT, -- How this standard is used in this career
    real_world_example TEXT, -- Concrete example of usage
    
    -- Importance by Career Stage
    importance_entry_level INTEGER DEFAULT 5, -- 1-10 scale
    importance_mid_career INTEGER DEFAULT 5,
    importance_senior_level INTEGER DEFAULT 5,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(career_code, common_core_id)
);

-- 4. Student Career Interests
CREATE TABLE IF NOT EXISTS student_career_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Student Identity
    student_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    
    -- Career Interests
    primary_career_code VARCHAR(50),
    secondary_career_codes VARCHAR(50)[],
    
    -- Interest Metrics
    interest_level INTEGER DEFAULT 5 CHECK (interest_level BETWEEN 1 AND 10),
    confidence_level INTEGER DEFAULT 5 CHECK (confidence_level BETWEEN 1 AND 10),
    
    -- Assessment Results
    career_assessment_date DATE,
    assessment_results JSONB,
    
    -- Progress Tracking
    skills_completed INTEGER DEFAULT 0,
    skills_in_progress INTEGER DEFAULT 0,
    skills_remaining INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(student_id, tenant_id)
);

-- 5. Student Skill Progress (Common Core)
CREATE TABLE IF NOT EXISTS student_common_core_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identity
    student_id UUID NOT NULL,
    common_core_id VARCHAR(20) NOT NULL REFERENCES common_core_standards(common_core_id),
    
    -- Progress Metrics
    status VARCHAR(20) DEFAULT 'not_started', -- not_started, in_progress, completed, mastered
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    mastery_level INTEGER DEFAULT 0 CHECK (mastery_level BETWEEN 0 AND 5),
    
    -- Performance Data
    attempts INTEGER DEFAULT 0,
    successful_attempts INTEGER DEFAULT 0,
    average_score DECIMAL(5,2),
    best_score DECIMAL(5,2),
    
    -- Time Tracking
    time_spent_minutes INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    last_activity_at TIMESTAMP WITH TIME ZONE,
    
    -- Career Relevance
    relevant_careers TEXT[], -- Which careers this helps with
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(student_id, common_core_id)
);

-- 6. Career Readiness Scores
CREATE TABLE IF NOT EXISTS career_readiness_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identity
    student_id UUID NOT NULL,
    career_code VARCHAR(50) NOT NULL,
    
    -- Readiness Metrics
    overall_readiness_score DECIMAL(5,2), -- 0-100 percentage
    essential_skills_score DECIMAL(5,2),
    recommended_skills_score DECIMAL(5,2),
    
    -- Skill Counts
    essential_skills_completed INTEGER DEFAULT 0,
    essential_skills_total INTEGER DEFAULT 0,
    recommended_skills_completed INTEGER DEFAULT 0,
    recommended_skills_total INTEGER DEFAULT 0,
    
    -- Gap Analysis
    top_missing_skills TEXT[], -- Common core IDs of most important missing skills
    estimated_hours_to_ready DECIMAL(6,2),
    
    -- Recommendations
    next_skills_to_learn TEXT[], -- Ordered list of next common_core_ids
    recommended_resources JSONB,
    
    -- Calculation Date
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(student_id, career_code)
);

-- 7. Career Skill Clusters (Grouping related skills)
CREATE TABLE IF NOT EXISTS career_skill_clusters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Cluster Identity
    cluster_name VARCHAR(100) NOT NULL,
    cluster_category VARCHAR(50) NOT NULL, -- Technical, Analytical, Communication, etc.
    
    -- Skills in Cluster
    common_core_ids TEXT[] NOT NULL,
    
    -- Career Relevance
    relevant_careers TEXT[], -- Career codes
    
    -- Learning Path
    recommended_sequence INTEGER[], -- Order to learn skills in cluster
    estimated_total_hours DECIMAL(6,2),
    
    -- Metadata
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Learning Path Recommendations
CREATE TABLE IF NOT EXISTS career_learning_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Path Identity
    student_id UUID NOT NULL,
    career_code VARCHAR(50) NOT NULL,
    
    -- Path Details
    path_name TEXT NOT NULL,
    path_type VARCHAR(50), -- Fast Track, Comprehensive, Balanced
    
    -- Skill Sequence
    skill_sequence JSONB NOT NULL, -- Ordered list with prerequisites
    current_position INTEGER DEFAULT 0,
    
    -- Time Estimates
    estimated_completion_hours DECIMAL(6,2),
    target_completion_date DATE,
    
    -- Progress
    skills_completed INTEGER DEFAULT 0,
    skills_total INTEGER DEFAULT 0,
    percentage_complete DECIMAL(5,2) DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active', -- active, paused, completed
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Career Content Cache (Pre-generated career-aligned content)
CREATE TABLE IF NOT EXISTS career_aligned_content_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Content Identity
    common_core_id VARCHAR(20) NOT NULL,
    career_code VARCHAR(50) NOT NULL,
    container_type VARCHAR(20) NOT NULL, -- learn, experience, discover
    
    -- Content
    content_data JSONB NOT NULL,
    
    -- Career Context
    career_context_intro TEXT,
    real_world_application TEXT,
    career_specific_examples JSONB,
    
    -- Validation
    is_validated BOOLEAN DEFAULT FALSE,
    validation_score DECIMAL(5,2),
    
    -- Cache Management
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '90 days'),
    access_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(common_core_id, career_code, container_type)
);

-- INDEXES for performance
CREATE INDEX idx_cc_standards_subject_grade ON common_core_standards(subject, grade);
CREATE INDEX idx_cc_standards_skills_area ON common_core_standards(skills_area);
CREATE INDEX idx_cc_standards_id ON common_core_standards(common_core_id);

CREATE INDEX idx_career_mapping_career ON career_standard_mapping(career_code);
CREATE INDEX idx_career_mapping_standard ON career_standard_mapping(common_core_id);
CREATE INDEX idx_career_mapping_relevance ON career_standard_mapping(relevance_level);

CREATE INDEX idx_student_progress_student ON student_common_core_progress(student_id);
CREATE INDEX idx_student_progress_standard ON student_common_core_progress(common_core_id);
CREATE INDEX idx_student_progress_status ON student_common_core_progress(status);

CREATE INDEX idx_career_readiness_student ON career_readiness_scores(student_id);
CREATE INDEX idx_career_readiness_career ON career_readiness_scores(career_code);

CREATE INDEX idx_career_content_cache ON career_aligned_content_cache(common_core_id, career_code);

-- VIEWS for analysis
CREATE OR REPLACE VIEW student_career_alignment AS
SELECT 
    sci.student_id,
    sci.primary_career_code,
    cp.career_name,
    crs.overall_readiness_score,
    crs.essential_skills_completed,
    crs.essential_skills_total,
    CASE 
        WHEN crs.essential_skills_total > 0 
        THEN ROUND((crs.essential_skills_completed::DECIMAL / crs.essential_skills_total) * 100, 2)
        ELSE 0 
    END as essential_completion_percentage,
    crs.estimated_hours_to_ready
FROM student_career_interests sci
JOIN career_paths cp ON sci.primary_career_code = cp.career_code
LEFT JOIN career_readiness_scores crs ON sci.student_id = crs.student_id 
    AND sci.primary_career_code = crs.career_code;

CREATE OR REPLACE VIEW career_skill_requirements AS
SELECT 
    cp.career_code,
    cp.career_name,
    cp.career_category,
    csm.relevance_level,
    COUNT(csm.common_core_id) as skill_count,
    ARRAY_AGG(csm.common_core_id ORDER BY csm.relevance_score DESC) as skills
FROM career_paths cp
JOIN career_standard_mapping csm ON cp.career_code = csm.career_code
GROUP BY cp.career_code, cp.career_name, cp.career_category, csm.relevance_level
ORDER BY cp.career_category, cp.career_name, csm.relevance_level;

-- FUNCTIONS
CREATE OR REPLACE FUNCTION calculate_career_readiness(
    p_student_id UUID,
    p_career_code VARCHAR(50)
) RETURNS DECIMAL AS $$
DECLARE
    v_essential_total INTEGER;
    v_essential_completed INTEGER;
    v_recommended_total INTEGER;
    v_recommended_completed INTEGER;
    v_readiness_score DECIMAL(5,2);
BEGIN
    -- Count essential skills
    SELECT COUNT(*)
    INTO v_essential_total
    FROM career_standard_mapping csm
    WHERE csm.career_code = p_career_code
    AND csm.relevance_level = 'Essential';
    
    -- Count completed essential skills
    SELECT COUNT(*)
    INTO v_essential_completed
    FROM career_standard_mapping csm
    JOIN student_common_core_progress sccp ON csm.common_core_id = sccp.common_core_id
    WHERE csm.career_code = p_career_code
    AND csm.relevance_level = 'Essential'
    AND sccp.student_id = p_student_id
    AND sccp.status IN ('completed', 'mastered');
    
    -- Count recommended skills
    SELECT COUNT(*)
    INTO v_recommended_total
    FROM career_standard_mapping csm
    WHERE csm.career_code = p_career_code
    AND csm.relevance_level = 'Recommended';
    
    -- Count completed recommended skills
    SELECT COUNT(*)
    INTO v_recommended_completed
    FROM career_standard_mapping csm
    JOIN student_common_core_progress sccp ON csm.common_core_id = sccp.common_core_id
    WHERE csm.career_code = p_career_code
    AND csm.relevance_level = 'Recommended'
    AND sccp.student_id = p_student_id
    AND sccp.status IN ('completed', 'mastered');
    
    -- Calculate weighted readiness score
    -- Essential skills worth 70%, Recommended worth 30%
    v_readiness_score := 0;
    
    IF v_essential_total > 0 THEN
        v_readiness_score := v_readiness_score + 
            ((v_essential_completed::DECIMAL / v_essential_total) * 70);
    END IF;
    
    IF v_recommended_total > 0 THEN
        v_readiness_score := v_readiness_score + 
            ((v_recommended_completed::DECIMAL / v_recommended_total) * 30);
    END IF;
    
    -- Update or insert the score
    INSERT INTO career_readiness_scores (
        student_id, career_code, overall_readiness_score,
        essential_skills_completed, essential_skills_total,
        recommended_skills_completed, recommended_skills_total,
        calculated_at
    ) VALUES (
        p_student_id, p_career_code, v_readiness_score,
        v_essential_completed, v_essential_total,
        v_recommended_completed, v_recommended_total,
        NOW()
    )
    ON CONFLICT (student_id, career_code) 
    DO UPDATE SET
        overall_readiness_score = v_readiness_score,
        essential_skills_completed = v_essential_completed,
        essential_skills_total = v_essential_total,
        recommended_skills_completed = v_recommended_completed,
        recommended_skills_total = v_recommended_total,
        calculated_at = NOW(),
        updated_at = NOW();
    
    RETURN v_readiness_score;
END;
$$ LANGUAGE plpgsql;

-- Sample data for career paths
INSERT INTO career_paths (career_code, career_name, career_category, description) VALUES
('engineering', 'Engineering', 'STEM', 'Design, develop, and maintain structures, machines, and systems'),
('data_science', 'Data Science', 'STEM', 'Analyze complex data to help organizations make decisions'),
('medicine', 'Medicine', 'Healthcare', 'Diagnose and treat illnesses, injuries, and health conditions'),
('finance', 'Finance', 'Business', 'Manage money, investments, and financial planning'),
('law', 'Law', 'Legal', 'Provide legal advice, represent clients, and ensure justice'),
('computer_science', 'Computer Science', 'STEM', 'Design and develop software, algorithms, and computing systems'),
('architecture', 'Architecture', 'Design', 'Design buildings and spaces that are functional and aesthetic'),
('marketing', 'Marketing', 'Business', 'Promote products and services to target audiences'),
('education', 'Education', 'Education', 'Teach and guide students in their learning journey'),
('research', 'Research', 'STEM', 'Conduct systematic investigation to establish facts and reach conclusions')
ON CONFLICT (career_code) DO NOTHING;