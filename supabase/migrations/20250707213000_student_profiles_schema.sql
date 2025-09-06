-- ================================================================
-- STUDENT PROFILES DATABASE SCHEMA
-- Migration: 20250707213000_student_profiles_schema
-- ================================================================

-- Create student_profiles table
CREATE TABLE IF NOT EXISTS student_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  grade_level TEXT NOT NULL CHECK (grade_level IN ('Pre-K', 'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12')),
  date_of_birth DATE,
  enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  learning_preferences JSONB DEFAULT '{}',
  parent_email TEXT,
  school_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Foreign key to auth.users (will be enforced at application level for compatibility)
  UNIQUE(user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_grade_level ON student_profiles(grade_level);
CREATE INDEX IF NOT EXISTS idx_student_profiles_school_id ON student_profiles(school_id) WHERE school_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_student_profiles_grade_active ON student_profiles(grade_level, is_active);
CREATE INDEX IF NOT EXISTS idx_student_profiles_enrollment_date ON student_profiles(enrollment_date);

-- Enable Row Level Security
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "student_profiles_select_policy" ON student_profiles;
CREATE POLICY "student_profiles_select_policy" 
ON student_profiles FOR SELECT 
USING (
  auth.uid()::text = user_id::text OR 
  auth.jwt() ->> 'role' = 'service_role' OR
  auth.jwt() ->> 'role' = 'admin'
);

DROP POLICY IF EXISTS "student_profiles_insert_policy" ON student_profiles;
CREATE POLICY "student_profiles_insert_policy" 
ON student_profiles FOR INSERT 
WITH CHECK (
  auth.uid()::text = user_id::text OR 
  auth.jwt() ->> 'role' = 'service_role' OR
  auth.jwt() ->> 'role' = 'admin'
);

DROP POLICY IF EXISTS "student_profiles_update_policy" ON student_profiles;
CREATE POLICY "student_profiles_update_policy" 
ON student_profiles FOR UPDATE 
USING (
  auth.uid()::text = user_id::text OR 
  auth.jwt() ->> 'role' = 'service_role' OR
  auth.jwt() ->> 'role' = 'admin'
);

DROP POLICY IF EXISTS "student_profiles_delete_policy" ON student_profiles;
CREATE POLICY "student_profiles_delete_policy" 
ON student_profiles FOR DELETE 
USING (
  auth.jwt() ->> 'role' = 'service_role' OR
  auth.jwt() ->> 'role' = 'admin'
);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for student_profiles
DROP TRIGGER IF EXISTS update_student_profiles_updated_at ON student_profiles;
CREATE TRIGGER update_student_profiles_updated_at 
    BEFORE UPDATE ON student_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample test profiles
-- Note: These user_ids should match existing test users in your auth system
INSERT INTO student_profiles (
  user_id,
  first_name,
  last_name,
  display_name,
  grade_level,
  date_of_birth,
  learning_preferences,
  parent_email,
  school_id
) VALUES
  -- Test Profile 1: Pre-K Emma
  (
    'test_user_emma_prek'::uuid,
    'Emma',
    'Student',
    'Emma',
    'Pre-K',
    '2020-03-15'::date,
    '{"learning_style": "visual", "favorite_subjects": ["Math", "Art"], "attention_span": "short", "prefers_hands_on": true}'::jsonb,
    'parent.emma@pathfinity.test',
    'test_school_001'
  ),
  -- Test Profile 2: Grade 1 Alex (updated for proper testbed structure)
  (
    'test_user_alex_sandview'::uuid,
    'Alex',
    'Davis', 
    'Alex Davis',
    '1',
    '2019-07-22'::date,
    '{"learning_style": "kinesthetic", "favorite_subjects": ["Math", "Science"], "attention_span": "medium", "prefers_hands_on": true}'::jsonb,
    'alex.davis@sandview.plainviewisd.edu',
    'sand-view-elementary-school-001'
  ),
  -- Test Profile 4: Pre-K (additional for testing)
  (
    'test_user_maya_prek'::uuid,
    'Maya',
    'Student',
    'Maya',
    'Pre-K',
    '2020-01-30'::date,
    '{"learning_style": "mixed", "favorite_subjects": ["Art", "Music"], "attention_span": "short", "needs_encouragement": true}'::jsonb,
    'parent.maya@pathfinity.test',
    'test_school_001'
  )
ON CONFLICT (user_id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  display_name = EXCLUDED.display_name,
  grade_level = EXCLUDED.grade_level,
  date_of_birth = EXCLUDED.date_of_birth,
  learning_preferences = EXCLUDED.learning_preferences,
  parent_email = EXCLUDED.parent_email,
  school_id = EXCLUDED.school_id,
  updated_at = NOW();

-- Create view for profile summary (useful for dashboards)
CREATE OR REPLACE VIEW student_profile_summary AS
SELECT 
  id,
  user_id,
  display_name,
  grade_level,
  EXTRACT(YEAR FROM AGE(date_of_birth)) AS age,
  enrollment_date,
  learning_preferences ->> 'learning_style' AS learning_style,
  learning_preferences ->> 'attention_span' AS attention_span,
  is_active,
  created_at
FROM student_profiles
WHERE is_active = true;

-- Grant access to the view
ALTER VIEW student_profile_summary OWNER TO postgres;

-- Add helpful comments
COMMENT ON TABLE student_profiles IS 'Student profile information for personalized learning';
COMMENT ON COLUMN student_profiles.learning_preferences IS 'JSON data for AI personalization and learning style preferences';
COMMENT ON COLUMN student_profiles.grade_level IS 'Current grade level - used for curriculum alignment';
COMMENT ON COLUMN student_profiles.display_name IS 'Preferred name shown in UI and dashboards';