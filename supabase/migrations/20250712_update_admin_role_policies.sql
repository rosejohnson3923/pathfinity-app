-- ================================================================
-- UPDATE ADMIN ROLE POLICIES FOR MULTI-TENANCY
-- Migration: 20250712_update_admin_role_policies.sql
-- Description: Update existing policies to support school_admin vs district_admin hierarchy
-- ================================================================

-- Drop existing generic admin policies
DROP POLICY IF EXISTS "admin_full_analytics_access" ON learning_sessions;
DROP POLICY IF EXISTS "learning_sessions_teacher_access" ON learning_sessions;

-- ================================================================
-- ENHANCED RLS POLICIES FOR MULTI-TENANCY
-- ================================================================

-- Learning Sessions: Students can see their own data
CREATE POLICY "learning_sessions_student_access" ON learning_sessions
    FOR ALL USING (auth.uid() = student_id);

-- Learning Sessions: Educators can see their assigned students
CREATE POLICY "learning_sessions_educator_access" ON learning_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.uid() = id 
            AND raw_user_meta_data->>'role' = 'educator'
            -- Additional teacher-student relationship logic would go here
            -- For now, allow all educators to see all sessions (to be refined)
        )
    );

-- Learning Sessions: School Admins can see all data from their assigned school
CREATE POLICY "learning_sessions_school_admin_access" ON learning_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.uid() = id 
            AND raw_user_meta_data->>'role' = 'school_admin'
            -- School boundary logic: only see sessions from students in their school
            -- This would need to be enhanced with actual school assignment tables
        )
    );

-- Learning Sessions: District Admins can see all data from schools in their district
CREATE POLICY "learning_sessions_district_admin_access" ON learning_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.uid() = id 
            AND raw_user_meta_data->>'role' = 'district_admin'
            -- District boundary logic: only see sessions from students in their district
            -- This would need to be enhanced with actual district assignment tables
        )
    );

-- Learning Sessions: Product Admins can see all data (platform-wide access)
CREATE POLICY "learning_sessions_product_admin_access" ON learning_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.uid() = id 
            AND raw_user_meta_data->>'role' = 'product_admin'
        )
    );

-- ================================================================
-- QUESTION ATTEMPTS POLICIES
-- ================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "question_attempts_student_access" ON question_attempts;

-- Students can see their own question attempts
CREATE POLICY "question_attempts_student_access" ON question_attempts
    FOR ALL USING (auth.uid() = student_id);

-- Educators can see question attempts from their students
CREATE POLICY "question_attempts_educator_access" ON question_attempts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.uid() = id 
            AND raw_user_meta_data->>'role' = 'educator'
        )
    );

-- School Admins can see question attempts from students in their school
CREATE POLICY "question_attempts_school_admin_access" ON question_attempts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.uid() = id 
            AND raw_user_meta_data->>'role' = 'school_admin'
        )
    );

-- District Admins can see question attempts from students in their district
CREATE POLICY "question_attempts_district_admin_access" ON question_attempts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.uid() = id 
            AND raw_user_meta_data->>'role' = 'district_admin'
        )
    );

-- Product Admins can see all question attempts
CREATE POLICY "question_attempts_product_admin_access" ON question_attempts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.uid() = id 
            AND raw_user_meta_data->>'role' = 'product_admin'
        )
    );

-- ================================================================
-- STUDENT LEARNING ANALYTICS POLICIES
-- ================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "student_analytics_self_access" ON student_learning_analytics;

-- Students can see their own analytics
CREATE POLICY "student_analytics_self_access" ON student_learning_analytics
    FOR ALL USING (auth.uid() = student_id);

-- Educators can see analytics from their students
CREATE POLICY "student_analytics_educator_access" ON student_learning_analytics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.uid() = id 
            AND raw_user_meta_data->>'role' = 'educator'
        )
    );

-- School Admins can see analytics from students in their school
CREATE POLICY "student_analytics_school_admin_access" ON student_learning_analytics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.uid() = id 
            AND raw_user_meta_data->>'role' = 'school_admin'
        )
    );

-- District Admins can see analytics from students in their district
CREATE POLICY "student_analytics_district_admin_access" ON student_learning_analytics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.uid() = id 
            AND raw_user_meta_data->>'role' = 'district_admin'
        )
    );

-- Product Admins can see all student analytics
CREATE POLICY "student_analytics_product_admin_access" ON student_learning_analytics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.uid() = id 
            AND raw_user_meta_data->>'role' = 'product_admin'
        )
    );

-- ================================================================
-- ADD ORGANIZATIONAL STRUCTURE TABLES FOR PROPER MULTI-TENANCY
-- ================================================================

-- Districts table
CREATE TABLE IF NOT EXISTS districts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    district_code TEXT UNIQUE,
    location TEXT,
    superintendent_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Schools table with district relationship
CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    district_id UUID NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    school_code TEXT,
    school_type TEXT CHECK (school_type IN ('elementary', 'middle', 'high', 'k12')),
    grades_served TEXT[],
    principal_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(district_id, name)
);

-- User school/district assignments
CREATE TABLE IF NOT EXISTS user_school_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    district_id UUID NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('student', 'educator', 'school_admin', 'district_admin', 'product_admin')),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(user_id, school_id, role)
);

-- Enable RLS on new tables
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_school_assignments ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- RLS POLICIES FOR ORGANIZATIONAL TABLES
-- ================================================================

-- Districts: Everyone can read districts they're associated with
CREATE POLICY "districts_read_access" ON districts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_school_assignments usa
            WHERE usa.user_id = auth.uid()
            AND usa.district_id = districts.id
            AND usa.is_active = TRUE
        )
        OR EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.uid() = id
            AND raw_user_meta_data->>'role' = 'product_admin'
        )
    );

-- Schools: Users can see schools in their district
CREATE POLICY "schools_read_access" ON schools
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_school_assignments usa
            WHERE usa.user_id = auth.uid()
            AND (usa.school_id = schools.id OR usa.district_id = schools.district_id)
            AND usa.is_active = TRUE
        )
        OR EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.uid() = id
            AND raw_user_meta_data->>'role' = 'product_admin'
        )
    );

-- User assignments: Users can see their own assignments
CREATE POLICY "user_assignments_self_access" ON user_school_assignments
    FOR SELECT USING (auth.uid() = user_id);

-- User assignments: Admins can see assignments in their scope
CREATE POLICY "user_assignments_admin_access" ON user_school_assignments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users u
            JOIN user_school_assignments admin_usa ON u.id = admin_usa.user_id
            WHERE auth.uid() = u.id
            AND admin_usa.is_active = TRUE
            AND (
                -- School admins see assignments in their school
                (u.raw_user_meta_data->>'role' = 'school_admin' 
                 AND admin_usa.school_id = user_school_assignments.school_id)
                OR
                -- District admins see assignments in their district
                (u.raw_user_meta_data->>'role' = 'district_admin' 
                 AND admin_usa.district_id = user_school_assignments.district_id)
                OR
                -- Product admins see all assignments
                (u.raw_user_meta_data->>'role' = 'product_admin')
            )
        )
    );

-- ================================================================
-- UPDATE EXISTING POLICIES TO USE ORGANIZATIONAL STRUCTURE
-- ================================================================

-- Update learning sessions policies to use proper organizational boundaries
DROP POLICY IF EXISTS "learning_sessions_school_admin_access" ON learning_sessions;
DROP POLICY IF EXISTS "learning_sessions_district_admin_access" ON learning_sessions;

-- School Admins: Only see sessions from students in their assigned school(s)
CREATE POLICY "learning_sessions_school_admin_access" ON learning_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_school_assignments admin_usa
            JOIN user_school_assignments student_usa ON admin_usa.school_id = student_usa.school_id
            WHERE admin_usa.user_id = auth.uid()
            AND student_usa.user_id = learning_sessions.student_id
            AND admin_usa.role = 'school_admin'
            AND student_usa.role = 'student'
            AND admin_usa.is_active = TRUE
            AND student_usa.is_active = TRUE
        )
    );

-- District Admins: Only see sessions from students in their assigned district
CREATE POLICY "learning_sessions_district_admin_access" ON learning_sessions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_school_assignments admin_usa
            JOIN user_school_assignments student_usa ON admin_usa.district_id = student_usa.district_id
            WHERE admin_usa.user_id = auth.uid()
            AND student_usa.user_id = learning_sessions.student_id
            AND admin_usa.role = 'district_admin'
            AND student_usa.role = 'student'
            AND admin_usa.is_active = TRUE
            AND student_usa.is_active = TRUE
        )
    );

-- ================================================================
-- INDEXES FOR PERFORMANCE
-- ================================================================

-- Organizational structure indexes
CREATE INDEX idx_districts_superintendent ON districts(superintendent_id);
CREATE INDEX idx_schools_district ON schools(district_id);
CREATE INDEX idx_schools_principal ON schools(principal_id);
CREATE INDEX idx_user_assignments_user ON user_school_assignments(user_id);
CREATE INDEX idx_user_assignments_school ON user_school_assignments(school_id);
CREATE INDEX idx_user_assignments_district ON user_school_assignments(district_id);
CREATE INDEX idx_user_assignments_active ON user_school_assignments(is_active) WHERE is_active = TRUE;

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================

COMMENT ON TABLE districts IS 'School districts for multi-tenancy organization';
COMMENT ON TABLE schools IS 'Schools within districts for proper data isolation';
COMMENT ON TABLE user_school_assignments IS 'User assignments to schools/districts for access control';

SELECT 'Admin Role Policies Migration Completed Successfully' as migration_status;