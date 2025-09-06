-- ================================================================
-- PATHFINITY SKILLS DATABASE SCHEMA
-- Execute this in Supabase SQL Editor
-- ================================================================

-- Create skills_master table
CREATE TABLE IF NOT EXISTS skills_master (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL CHECK (subject IN ('Math', 'ELA', 'Science', 'SocialStudies')),
  grade TEXT NOT NULL CHECK (grade IN ('Pre-K', 'K')),
  skills_area TEXT NOT NULL,
  skills_cluster TEXT NOT NULL,
  skill_number TEXT NOT NULL,
  skill_name TEXT NOT NULL,
  skill_description TEXT,
  difficulty_level INTEGER NOT NULL CHECK (difficulty_level BETWEEN 1 AND 10),
  estimated_time_minutes INTEGER NOT NULL CHECK (estimated_time_minutes > 0),
  prerequisites UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(subject, grade, skills_area, skill_number)
);

-- Create student_skill_progress table
CREATE TABLE IF NOT EXISTS student_skill_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id TEXT NOT NULL,
  skill_id UUID NOT NULL REFERENCES skills_master(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'mastered')),
  attempts INTEGER DEFAULT 0 CHECK (attempts >= 0),
  score DECIMAL(3,2) CHECK (score >= 0 AND score <= 1),
  time_spent_minutes INTEGER DEFAULT 0 CHECK (time_spent_minutes >= 0),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, skill_id)
);

-- Create daily_assignments table
CREATE TABLE IF NOT EXISTS daily_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id TEXT NOT NULL,
  assignment_date DATE NOT NULL,
  skill_id UUID NOT NULL REFERENCES skills_master(id) ON DELETE CASCADE,
  subject TEXT NOT NULL CHECK (subject IN ('Math', 'ELA', 'Science', 'SocialStudies')),
  estimated_time_minutes INTEGER NOT NULL CHECK (estimated_time_minutes > 0),
  assigned_tool TEXT NOT NULL CHECK (assigned_tool IN ('MasterToolInterface', 'AlgebraTiles', 'GraphingCalculator', 'VirtualLab', 'WritingStudio', 'BrandStudio')),
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'started', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, assignment_date, skill_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_skills_master_grade_subject ON skills_master(grade, subject);
CREATE INDEX IF NOT EXISTS idx_skills_master_skills_area ON skills_master(skills_area);
CREATE INDEX IF NOT EXISTS idx_student_progress_student_skill ON student_skill_progress(student_id, skill_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_status ON student_skill_progress(status);
CREATE INDEX IF NOT EXISTS idx_daily_assignments_date_student ON daily_assignments(assignment_date, student_id);
CREATE INDEX IF NOT EXISTS idx_daily_assignments_status ON daily_assignments(status);

-- Enable Row Level Security
ALTER TABLE skills_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_skill_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (drop existing first to avoid conflicts)
DROP POLICY IF EXISTS "skills_master_read_policy" ON skills_master;
CREATE POLICY "skills_master_read_policy" 
ON skills_master FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "student_progress_user_policy" ON student_skill_progress;
CREATE POLICY "student_progress_user_policy" 
ON student_skill_progress FOR ALL 
USING (auth.uid()::text = student_id OR auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "daily_assignments_user_policy" ON daily_assignments;
CREATE POLICY "daily_assignments_user_policy" 
ON daily_assignments FOR ALL 
USING (auth.uid()::text = student_id OR auth.jwt() ->> 'role' = 'service_role');