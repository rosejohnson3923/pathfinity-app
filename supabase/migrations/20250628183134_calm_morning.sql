/*
  # Learning System Schema

  1. New Tables
    - `subjects`
      - Core academic subjects with grade level mappings
    - `mastery_groups`
      - Skill groupings within subjects
    - `skills_topics`
      - Individual learning objectives
    - `lesson_plans`
      - Daily AI-generated lessons
    - `student_progress`
      - Individual progress tracking
    - `assessments`
      - Evaluation and testing data
    - `learning_paths`
      - Personalized learning sequences

  2. Security
    - Enable RLS on all tables
    - Add tenant isolation policies
    - Add role-based access policies
*/

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  code text NOT NULL, -- e.g., 'MATH', 'ELA', 'SCI'
  grade_levels text[] NOT NULL, -- e.g., ['K', '1', '2', '3']
  description text,
  color text DEFAULT '#3B82F6',
  icon text DEFAULT 'book-open',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create mastery groups table
CREATE TABLE IF NOT EXISTS mastery_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  grade_level text NOT NULL,
  sequence_order integer NOT NULL DEFAULT 1,
  prerequisites uuid[], -- array of mastery_group ids
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create skills topics table
CREATE TABLE IF NOT EXISTS skills_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  mastery_group_id uuid REFERENCES mastery_groups(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  learning_objectives text[],
  difficulty_level integer DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  estimated_duration_minutes integer DEFAULT 30,
  sequence_order integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create lesson plans table
CREATE TABLE IF NOT EXISTS lesson_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  skills_topic_id uuid REFERENCES skills_topics(id) ON DELETE CASCADE NOT NULL,
  lesson_type text NOT NULL CHECK (lesson_type IN ('reinforcement', 'pathway', 'future_pathway')),
  content jsonb NOT NULL, -- AI-generated lesson content
  difficulty_adjustment integer DEFAULT 0, -- -2 to +2 adjustment
  estimated_duration_minutes integer DEFAULT 30,
  scheduled_date date NOT NULL,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'skipped')),
  completion_percentage integer DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
  time_spent_minutes integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create student progress table
CREATE TABLE IF NOT EXISTS student_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  mastery_group_id uuid REFERENCES mastery_groups(id) ON DELETE CASCADE,
  skills_topic_id uuid REFERENCES skills_topics(id) ON DELETE CASCADE,
  mastery_level text NOT NULL DEFAULT 'does-not-meet' CHECK (mastery_level IN ('masters', 'meets', 'approaches', 'does-not-meet')),
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  streak_days integer DEFAULT 0,
  last_activity_date date,
  total_time_spent_minutes integer DEFAULT 0,
  lessons_completed integer DEFAULT 0,
  assessments_passed integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(student_id, subject_id, skills_topic_id)
);

-- Create assessments table
CREATE TABLE IF NOT EXISTS assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  skills_topic_id uuid REFERENCES skills_topics(id) ON DELETE CASCADE,
  assessment_type text NOT NULL CHECK (assessment_type IN ('diagnostic', 'formative', 'summative', 'adaptive')),
  questions jsonb NOT NULL, -- Assessment questions and structure
  responses jsonb, -- Student responses
  score_percentage integer CHECK (score_percentage BETWEEN 0 AND 100),
  mastery_demonstrated text CHECK (mastery_demonstrated IN ('masters', 'meets', 'approaches', 'does-not-meet')),
  time_taken_minutes integer,
  started_at timestamptz,
  completed_at timestamptz,
  status text DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'abandoned')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create learning paths table
CREATE TABLE IF NOT EXISTS learning_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  student_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
  path_sequence uuid[] NOT NULL, -- ordered array of skills_topic ids
  current_position integer DEFAULT 0,
  adaptive_adjustments jsonb DEFAULT '{}', -- AI-driven path modifications
  generated_at timestamptz DEFAULT now(),
  last_updated timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(student_id, subject_id)
);

-- Enable RLS on all tables
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE mastery_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;

-- Subjects policies
CREATE POLICY "Users can view subjects in their tenant"
  ON subjects FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Educators and admins can manage subjects in their tenant"
  ON subjects FOR ALL TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('educator', 'admin', 'product_admin')
    )
  );

-- Mastery groups policies
CREATE POLICY "Users can view mastery groups in their tenant"
  ON mastery_groups FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Educators and admins can manage mastery groups in their tenant"
  ON mastery_groups FOR ALL TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('educator', 'admin', 'product_admin')
    )
  );

-- Skills topics policies
CREATE POLICY "Users can view skills topics in their tenant"
  ON skills_topics FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Educators and admins can manage skills topics in their tenant"
  ON skills_topics FOR ALL TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('educator', 'admin', 'product_admin')
    )
  );

-- Lesson plans policies
CREATE POLICY "Students can view their own lesson plans"
  ON lesson_plans FOR SELECT TO authenticated
  USING (
    student_id = auth.uid() AND 
    tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Students can update their own lesson progress"
  ON lesson_plans FOR UPDATE TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Educators can view lesson plans for students in their tenant"
  ON lesson_plans FOR SELECT TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('educator', 'admin', 'product_admin')
    )
  );

-- Student progress policies
CREATE POLICY "Students can view their own progress"
  ON student_progress FOR SELECT TO authenticated
  USING (
    student_id = auth.uid() AND 
    tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
  );

CREATE POLICY "System can update student progress"
  ON student_progress FOR ALL TO authenticated
  USING (
    tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
  );

-- Assessments policies
CREATE POLICY "Students can manage their own assessments"
  ON assessments FOR ALL TO authenticated
  USING (
    student_id = auth.uid() AND 
    tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Educators can view assessments in their tenant"
  ON assessments FOR SELECT TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('educator', 'admin', 'product_admin')
    )
  );

-- Learning paths policies
CREATE POLICY "Students can view their own learning paths"
  ON learning_paths FOR SELECT TO authenticated
  USING (
    student_id = auth.uid() AND 
    tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
  );

CREATE POLICY "System can manage learning paths"
  ON learning_paths FOR ALL TO authenticated
  USING (
    tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subjects_tenant_id ON subjects(tenant_id);
CREATE INDEX IF NOT EXISTS idx_mastery_groups_subject_id ON mastery_groups(subject_id);
CREATE INDEX IF NOT EXISTS idx_skills_topics_mastery_group_id ON skills_topics(mastery_group_id);
CREATE INDEX IF NOT EXISTS idx_lesson_plans_student_id ON lesson_plans(student_id);
CREATE INDEX IF NOT EXISTS idx_lesson_plans_scheduled_date ON lesson_plans(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_student_progress_student_id ON student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_subject_id ON student_progress(subject_id);
CREATE INDEX IF NOT EXISTS idx_assessments_student_id ON assessments(student_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_student_id ON learning_paths(student_id);

-- Add updated_at triggers
CREATE TRIGGER update_subjects_updated_at 
  BEFORE UPDATE ON subjects 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mastery_groups_updated_at 
  BEFORE UPDATE ON mastery_groups 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skills_topics_updated_at 
  BEFORE UPDATE ON skills_topics 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lesson_plans_updated_at 
  BEFORE UPDATE ON lesson_plans 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_progress_updated_at 
  BEFORE UPDATE ON student_progress 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessments_updated_at 
  BEFORE UPDATE ON assessments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_paths_updated_at 
  BEFORE UPDATE ON learning_paths 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();