-- ================================================================
-- PATHFINITY SKILLS DATABASE SCHEMA
-- Migration: 20250707111717_pathfinity_skills_schema.sql
-- Description: Complete skills tracking system for Pre-K and Kindergarten
-- ================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- 1. SKILLS MASTER TABLE
-- Core table containing all available skills by subject and grade
-- ================================================================

CREATE TABLE skills_master (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject TEXT NOT NULL CHECK (subject IN ('Math', 'ELA', 'Science', 'SocialStudies')),
    grade TEXT NOT NULL CHECK (grade IN ('Pre-K', 'K')),
    skills_area TEXT NOT NULL,
    skills_cluster TEXT NOT NULL,
    skill_number TEXT NOT NULL,
    skill_name TEXT NOT NULL,
    skill_description TEXT,
    difficulty_level INTEGER NOT NULL CHECK (difficulty_level >= 1 AND difficulty_level <= 10),
    estimated_time_minutes INTEGER NOT NULL CHECK (estimated_time_minutes > 0),
    prerequisites TEXT[], -- Array of prerequisite skill IDs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique skill numbers per subject/grade
    UNIQUE(subject, grade, skill_number)
);

-- ================================================================
-- 2. STUDENT SKILL PROGRESS TABLE
-- Tracks individual student progress on each skill
-- ================================================================

CREATE TABLE student_skill_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills_master(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed', 'mastered')) DEFAULT 'not_started',
    attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
    score DECIMAL(3,2) CHECK (score >= 0.0 AND score <= 1.0), -- 0.00 to 1.00
    time_spent_minutes INTEGER NOT NULL DEFAULT 0 CHECK (time_spent_minutes >= 0),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one progress record per student per skill
    UNIQUE(student_id, skill_id)
);

-- ================================================================
-- 3. DAILY ASSIGNMENTS TABLE
-- Tracks daily skill assignments for each student
-- ================================================================

CREATE TABLE daily_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assignment_date DATE NOT NULL,
    skill_id UUID NOT NULL REFERENCES skills_master(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    estimated_time_minutes INTEGER NOT NULL CHECK (estimated_time_minutes > 0),
    assigned_tool TEXT NOT NULL CHECK (assigned_tool IN ('MasterToolInterface', 'AlgebraTiles', 'GraphingCalculator', 'VirtualLab', 'WritingStudio', 'BrandStudio')),
    status TEXT NOT NULL CHECK (status IN ('assigned', 'started', 'completed')) DEFAULT 'assigned',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Allow multiple skills per day but prevent duplicate skill assignments on same day
    UNIQUE(student_id, assignment_date, skill_id)
);

-- ================================================================
-- 4. PERFORMANCE INDEXES
-- Optimized indexes for common query patterns
-- ================================================================

-- Skills Master Indexes
CREATE INDEX idx_skills_master_subject_grade ON skills_master(subject, grade);
CREATE INDEX idx_skills_master_skills_area_cluster ON skills_master(skills_area, skills_cluster);
CREATE INDEX idx_skills_master_skill_number ON skills_master(skill_number);
CREATE INDEX idx_skills_master_difficulty ON skills_master(difficulty_level);

-- Student Skill Progress Indexes
CREATE INDEX idx_student_skill_progress_student_skill ON student_skill_progress(student_id, skill_id);
CREATE INDEX idx_student_skill_progress_student_status ON student_skill_progress(student_id, status);
CREATE INDEX idx_student_skill_progress_skill_status ON student_skill_progress(skill_id, status);
CREATE INDEX idx_student_skill_progress_completed_at ON student_skill_progress(completed_at);

-- Daily Assignments Indexes
CREATE INDEX idx_daily_assignments_student_date ON daily_assignments(student_id, assignment_date);
CREATE INDEX idx_daily_assignments_skill_id ON daily_assignments(skill_id);
CREATE INDEX idx_daily_assignments_date_status ON daily_assignments(assignment_date, status);
CREATE INDEX idx_daily_assignments_subject ON daily_assignments(subject);

-- ================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- Secure data access based on user authentication
-- ================================================================

-- Enable RLS on all tables
ALTER TABLE skills_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_skill_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_assignments ENABLE ROW LEVEL SECURITY;

-- Skills Master: Read access for all authenticated users
CREATE POLICY "Skills master read access" ON skills_master
    FOR SELECT USING (auth.role() = 'authenticated');

-- Student Skill Progress: Users can only access their own progress
CREATE POLICY "Student skill progress access" ON student_skill_progress
    FOR ALL USING (auth.uid() = student_id);

-- Daily Assignments: Students can only access their own assignments
CREATE POLICY "Daily assignments access" ON daily_assignments
    FOR ALL USING (auth.uid() = student_id);

-- Admin/Teacher access policies (for users with admin role)
CREATE POLICY "Admin skills master access" ON skills_master
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.uid() = id 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

CREATE POLICY "Admin student progress access" ON student_skill_progress
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.uid() = id 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

CREATE POLICY "Admin daily assignments access" ON daily_assignments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.uid() = id 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- ================================================================
-- 6. UTILITY FUNCTIONS
-- Helper functions for common operations
-- ================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_skills_master_updated_at BEFORE UPDATE ON skills_master
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_skill_progress_updated_at BEFORE UPDATE ON student_skill_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically update completed_at when status changes to completed/mastered
CREATE OR REPLACE FUNCTION update_skill_completion()
RETURNS TRIGGER AS $$
BEGIN
    -- Set completed_at when status changes to completed or mastered
    IF NEW.status IN ('completed', 'mastered') AND OLD.status NOT IN ('completed', 'mastered') THEN
        NEW.completed_at = NOW();
    END IF;
    
    -- Clear completed_at if status changes back to not_started or in_progress
    IF NEW.status IN ('not_started', 'in_progress') AND OLD.status IN ('completed', 'mastered') THEN
        NEW.completed_at = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_skill_completion_trigger BEFORE UPDATE ON student_skill_progress
    FOR EACH ROW EXECUTE FUNCTION update_skill_completion();

-- ================================================================
-- 7. SAMPLE DATA INSERTION FUNCTION
-- Function to help populate initial skills data
-- ================================================================

CREATE OR REPLACE FUNCTION insert_sample_pre_k_math_skills()
RETURNS VOID AS $$
BEGIN
    INSERT INTO skills_master (subject, grade, skills_area, skills_cluster, skill_number, skill_name, skill_description, difficulty_level, estimated_time_minutes) VALUES
    ('Math', 'Pre-K', 'Numbers', 'A', 'A.0', 'Identify numbers - up to 3', 'Student can recognize and identify numbers 0, 1, 2, and 3', 1, 15),
    ('Math', 'Pre-K', 'Numbers', 'A', 'A.1', 'Count objects - up to 3', 'Student can count physical objects up to 3 items', 2, 20),
    ('Math', 'Pre-K', 'Numbers', 'A', 'A.2', 'Number sequence - 1 to 3', 'Student can recite numbers in order from 1 to 3', 2, 15),
    ('Math', 'Pre-K', 'Counting', 'B', 'B.0', 'One-to-one correspondence', 'Student can match one number to one object', 3, 25),
    ('Math', 'Pre-K', 'Counting', 'B', 'B.1', 'Compare quantities - more/less', 'Student can identify which group has more or less', 4, 20),
    ('Math', 'K', 'Numbers', 'A', 'A.0', 'Identify numbers - up to 10', 'Student can recognize and identify numbers 0 through 10', 3, 20),
    ('Math', 'K', 'Numbers', 'A', 'A.1', 'Count objects - up to 10', 'Student can count physical objects up to 10 items', 4, 25),
    ('Math', 'K', 'Addition', 'C', 'C.0', 'Simple addition - sums to 5', 'Student can solve addition problems with sums up to 5', 5, 30);
    
    RAISE NOTICE 'Sample Pre-K and K Math skills inserted successfully';
END;
$$ language 'plpgsql';

-- ================================================================
-- 8. VIEWS FOR COMMON QUERIES
-- Convenient views for frequently accessed data
-- ================================================================

-- View: Student progress summary by subject
CREATE VIEW student_progress_summary AS
SELECT 
    ssp.student_id,
    sm.subject,
    sm.grade,
    COUNT(*) as total_skills,
    COUNT(CASE WHEN ssp.status = 'completed' THEN 1 END) as completed_skills,
    COUNT(CASE WHEN ssp.status = 'mastered' THEN 1 END) as mastered_skills,
    COUNT(CASE WHEN ssp.status = 'in_progress' THEN 1 END) as in_progress_skills,
    ROUND(AVG(ssp.score), 2) as average_score,
    SUM(ssp.time_spent_minutes) as total_time_minutes
FROM student_skill_progress ssp
JOIN skills_master sm ON ssp.skill_id = sm.id
GROUP BY ssp.student_id, sm.subject, sm.grade;

-- View: Daily assignment summary
CREATE VIEW daily_assignment_summary AS
SELECT 
    da.student_id,
    da.assignment_date,
    COUNT(*) as total_assignments,
    COUNT(CASE WHEN da.status = 'completed' THEN 1 END) as completed_assignments,
    COUNT(CASE WHEN da.status = 'started' THEN 1 END) as started_assignments,
    SUM(da.estimated_time_minutes) as total_estimated_minutes,
    STRING_AGG(DISTINCT da.subject, ', ') as subjects_assigned
FROM daily_assignments da
GROUP BY da.student_id, da.assignment_date;

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================

-- Insert comment for migration tracking
COMMENT ON TABLE skills_master IS 'Core skills database for Pathfinity educational platform - tracks all available skills by subject and grade level';
COMMENT ON TABLE student_skill_progress IS 'Individual student progress tracking for each skill - supports detailed analytics and adaptive learning';
COMMENT ON TABLE daily_assignments IS 'Daily skill assignments for students - integrates with AI-powered educational tools';

-- Log completion
SELECT 'Pathfinity Skills Schema Migration Completed Successfully' as migration_status;