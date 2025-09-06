/*
  # Projects and Collaboration Schema

  1. New Tables
    - `projects`
      - Student projects for Experience Mode
    - `project_members`
      - Team membership and roles
    - `project_submissions`
      - Project deliverables and submissions
    - `collaboration_spaces`
      - Shared workspaces for teams
    - `peer_reviews`
      - Student peer evaluation system
    - `mentorships`
      - Industry mentor assignments

  2. Security
    - Enable RLS on all tables
    - Add tenant isolation policies
    - Add project-based access policies
*/

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  creator_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  project_type text DEFAULT 'collaborative' CHECK (project_type IN ('individual', 'collaborative', 'mentored')),
  subject_areas text[], -- e.g., ['math', 'science', 'art']
  difficulty_level integer DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  estimated_duration_days integer DEFAULT 7,
  max_team_size integer DEFAULT 4,
  skills_required text[],
  skills_gained text[],
  resources jsonb DEFAULT '{}', -- links, files, tools needed
  rubric jsonb, -- evaluation criteria
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'in_progress', 'completed', 'archived')),
  start_date date,
  due_date date,
  is_template boolean DEFAULT false,
  template_category text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create project members table
CREATE TABLE IF NOT EXISTS project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'member' CHECK (role IN ('leader', 'member', 'mentor', 'observer')),
  joined_at timestamptz DEFAULT now(),
  contribution_score integer DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('invited', 'active', 'inactive', 'removed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Create project submissions table
CREATE TABLE IF NOT EXISTS project_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  submitter_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  submission_type text NOT NULL CHECK (submission_type IN ('milestone', 'draft', 'final', 'revision')),
  content jsonb NOT NULL, -- files, links, text content
  feedback jsonb DEFAULT '{}', -- educator and peer feedback
  grade_percentage integer CHECK (grade_percentage BETWEEN 0 AND 100),
  submitted_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  status text DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'needs_revision')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create collaboration spaces table
CREATE TABLE IF NOT EXISTS collaboration_spaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  space_type text NOT NULL CHECK (space_type IN ('chat', 'whiteboard', 'document', 'code', 'design')),
  content jsonb DEFAULT '{}', -- space-specific content
  settings jsonb DEFAULT '{}', -- permissions, notifications, etc.
  last_activity_at timestamptz DEFAULT now(),
  is_archived boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create peer reviews table
CREATE TABLE IF NOT EXISTS peer_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  reviewer_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  reviewee_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  submission_id uuid REFERENCES project_submissions(id) ON DELETE CASCADE,
  criteria jsonb NOT NULL, -- structured review criteria
  scores jsonb NOT NULL, -- numerical scores for each criterion
  comments text,
  overall_rating integer CHECK (overall_rating BETWEEN 1 AND 5),
  is_anonymous boolean DEFAULT true,
  submitted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(reviewer_id, reviewee_id, submission_id)
);

-- Create mentorships table
CREATE TABLE IF NOT EXISTS mentorships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  mentor_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  mentee_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  subject_area text NOT NULL,
  mentorship_type text DEFAULT 'project' CHECK (mentorship_type IN ('project', 'ongoing', 'career')),
  goals text[],
  meeting_schedule text, -- e.g., 'weekly', 'bi-weekly'
  status text DEFAULT 'active' CHECK (status IN ('pending', 'active', 'paused', 'completed')),
  start_date date DEFAULT CURRENT_DATE,
  end_date date,
  feedback_rating integer CHECK (feedback_rating BETWEEN 1 AND 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE peer_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorships ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Users can view projects in their tenant"
  ON projects FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create projects in their tenant"
  ON projects FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = auth.uid()) AND
    creator_id = auth.uid()
  );

CREATE POLICY "Project creators and admins can update projects"
  ON projects FOR UPDATE TO authenticated
  USING (
    creator_id = auth.uid() OR
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('educator', 'admin', 'product_admin')
    )
  );

-- Project members policies
CREATE POLICY "Project members can view membership"
  ON project_members FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    project_id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid()) OR
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('educator', 'admin', 'product_admin')
    )
  );

CREATE POLICY "Project leaders can manage membership"
  ON project_members FOR ALL TO authenticated
  USING (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid() AND role = 'leader'
    ) OR
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('educator', 'admin', 'product_admin')
    )
  );

-- Project submissions policies
CREATE POLICY "Project members can view submissions"
  ON project_submissions FOR SELECT TO authenticated
  USING (
    submitter_id = auth.uid() OR
    project_id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid()) OR
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('educator', 'admin', 'product_admin')
    )
  );

CREATE POLICY "Project members can create submissions"
  ON project_submissions FOR INSERT TO authenticated
  WITH CHECK (
    submitter_id = auth.uid() AND
    project_id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
  );

-- Collaboration spaces policies
CREATE POLICY "Project members can access collaboration spaces"
  ON collaboration_spaces FOR ALL TO authenticated
  USING (
    project_id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid()) OR
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('educator', 'admin', 'product_admin')
    )
  );

-- Peer reviews policies
CREATE POLICY "Users can manage their own reviews"
  ON peer_reviews FOR ALL TO authenticated
  USING (
    reviewer_id = auth.uid() OR
    reviewee_id = auth.uid() OR
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('educator', 'admin', 'product_admin')
    )
  );

-- Mentorships policies
CREATE POLICY "Mentors and mentees can view their mentorships"
  ON mentorships FOR SELECT TO authenticated
  USING (
    mentor_id = auth.uid() OR
    mentee_id = auth.uid() OR
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('educator', 'admin', 'product_admin')
    )
  );

CREATE POLICY "Mentors and mentees can update their mentorships"
  ON mentorships FOR UPDATE TO authenticated
  USING (mentor_id = auth.uid() OR mentee_id = auth.uid())
  WITH CHECK (mentor_id = auth.uid() OR mentee_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_tenant_id ON projects(tenant_id);
CREATE INDEX IF NOT EXISTS idx_projects_creator_id ON projects(creator_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_submissions_project_id ON project_submissions(project_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_spaces_project_id ON collaboration_spaces(project_id);
CREATE INDEX IF NOT EXISTS idx_peer_reviews_project_id ON peer_reviews(project_id);
CREATE INDEX IF NOT EXISTS idx_mentorships_mentor_id ON mentorships(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentorships_mentee_id ON mentorships(mentee_id);

-- Add updated_at triggers
CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON projects 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_members_updated_at 
  BEFORE UPDATE ON project_members 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_submissions_updated_at 
  BEFORE UPDATE ON project_submissions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collaboration_spaces_updated_at 
  BEFORE UPDATE ON collaboration_spaces 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_peer_reviews_updated_at 
  BEFORE UPDATE ON peer_reviews 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mentorships_updated_at 
  BEFORE UPDATE ON mentorships 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();