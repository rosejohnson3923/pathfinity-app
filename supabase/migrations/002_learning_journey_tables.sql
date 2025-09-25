-- =====================================================
-- Learning Journey Database Migration
-- Phase 2: Database Schema Implementation
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. MAIN LEARNING JOURNEYS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS learning_journeys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  tenant_id VARCHAR(255) NOT NULL,  -- String slugs like 'sand-view-elementary-school-001'
  grade_level VARCHAR(10) NOT NULL,  -- 'K', '1', '2', ... '12'
  school_year VARCHAR(20) NOT NULL,  -- '2024-2025' format

  -- Career and Companion
  career VARCHAR(100),
  career_data JSONB DEFAULT '{}',
  career_selected_date TIMESTAMP WITH TIME ZONE,
  companion VARCHAR(100),
  companion_data JSONB DEFAULT '{}',
  companion_selected_date TIMESTAMP WITH TIME ZONE,

  -- Progress Tracking
  completion_percentage DECIMAL(5,2) DEFAULT 0,
  skills_completed INTEGER DEFAULT 0,
  skills_total INTEGER DEFAULT 0,
  advanced_early BOOLEAN DEFAULT FALSE,

  -- Current Activity
  last_skill_completed VARCHAR(255),
  last_skill_completed_date TIMESTAMP WITH TIME ZONE,
  current_unit VARCHAR(255),
  current_lesson VARCHAR(255),

  -- Time and Streak Tracking
  time_spent_minutes INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_active_date DATE,

  -- Metadata
  started_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_user_tenant_grade UNIQUE(user_id, tenant_id, grade_level, school_year)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_journey_tenant_user_grade
  ON learning_journeys(tenant_id, user_id, grade_level);

CREATE INDEX IF NOT EXISTS idx_journey_user_school_year
  ON learning_journeys(user_id, school_year);

CREATE INDEX IF NOT EXISTS idx_journey_career
  ON learning_journeys(career) WHERE career IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_journey_companion
  ON learning_journeys(companion) WHERE companion IS NOT NULL;

-- =====================================================
-- 2. GRADE PROGRESSION TRACKING TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS grade_progression_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  tenant_id VARCHAR(255) NOT NULL,
  grade_level VARCHAR(10) NOT NULL,
  school_year VARCHAR(20) NOT NULL,

  -- Progress Details
  started_date TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_date TIMESTAMP WITH TIME ZONE,
  completion_percentage DECIMAL(5,2) DEFAULT 0,

  -- Advancement Tracking
  advanced_early BOOLEAN DEFAULT FALSE,
  advancement_date TIMESTAMP WITH TIME ZONE,
  advancement_by VARCHAR(50), -- 'student_completion' or 'parent_override'
  advancement_reason TEXT,

  -- Parent Override Details (if applicable)
  parent_id UUID,
  override_completion_percentage DECIMAL(5,2), -- % complete when parent overrode

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_user_grade_progression UNIQUE(user_id, tenant_id, grade_level, school_year)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_progression_user
  ON grade_progression_tracking(user_id, school_year, grade_level);

CREATE INDEX IF NOT EXISTS idx_progression_tenant
  ON grade_progression_tracking(tenant_id);

CREATE INDEX IF NOT EXISTS idx_progression_advancement
  ON grade_progression_tracking(advanced_early) WHERE advanced_early = TRUE;

-- =====================================================
-- 3. SKILL AUTHORITY TRACKING TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS skill_authority_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  tenant_id VARCHAR(255) NOT NULL,
  skill_id VARCHAR(100) NOT NULL,
  grade_level VARCHAR(10) NOT NULL,

  -- Completion Details
  completed_by VARCHAR(50) NOT NULL, -- 'student' or 'parent_override'
  completed_date TIMESTAMP WITH TIME ZONE NOT NULL,
  mastery_score DECIMAL(5,2),

  -- Performance Metrics
  attempts INTEGER DEFAULT 1,
  time_spent_minutes INTEGER DEFAULT 0,

  -- If parent override
  parent_id UUID,
  override_reason TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_user_skill UNIQUE(user_id, tenant_id, skill_id, grade_level)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_skill_user
  ON skill_authority_tracking(user_id, grade_level);

CREATE INDEX IF NOT EXISTS idx_skill_tenant
  ON skill_authority_tracking(tenant_id);

CREATE INDEX IF NOT EXISTS idx_skill_completed_by
  ON skill_authority_tracking(completed_by);

-- =====================================================
-- 4. REMEDIATION QUEUE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS remediation_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  tenant_id VARCHAR(255) NOT NULL,
  skill_id VARCHAR(100) NOT NULL,

  -- Grade Context
  from_grade VARCHAR(10) NOT NULL,  -- Original grade where skill was incomplete
  current_grade VARCHAR(10) NOT NULL,  -- User's current grade

  -- Timeline
  added_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,

  -- Priority and Status
  priority INTEGER DEFAULT 5, -- 1-10, 1 being highest priority
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'skipped'

  -- Remediation Details
  attempts INTEGER DEFAULT 0,
  last_attempt_date TIMESTAMP WITH TIME ZONE,
  mastery_score DECIMAL(5,2),

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_remediation_skill UNIQUE(user_id, tenant_id, skill_id, from_grade)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_remediation_user
  ON remediation_queue(user_id, status);

CREATE INDEX IF NOT EXISTS idx_remediation_tenant
  ON remediation_queue(tenant_id);

CREATE INDEX IF NOT EXISTS idx_remediation_priority
  ON remediation_queue(priority, due_date) WHERE status = 'pending';

-- =====================================================
-- 5. SYNC METADATA TABLE (For Cross-Device Support)
-- =====================================================
CREATE TABLE IF NOT EXISTS journey_sync_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  device_id VARCHAR(100) NOT NULL,

  -- Sync Information
  last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sync_version INTEGER DEFAULT 1,

  -- Conflict Resolution
  conflicts JSONB DEFAULT '[]',
  resolution_strategy VARCHAR(50) DEFAULT 'last_write_wins',

  -- Device Info
  device_info JSONB DEFAULT '{}',
  platform VARCHAR(50),
  app_version VARCHAR(20),

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_user_device UNIQUE(user_id, device_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sync_user
  ON journey_sync_metadata(user_id);

CREATE INDEX IF NOT EXISTS idx_sync_last_sync
  ON journey_sync_metadata(last_sync DESC);

-- =====================================================
-- 6. PARENT OVERRIDES AUDIT LOG
-- =====================================================
CREATE TABLE IF NOT EXISTS parent_override_audit (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL,
  parent_id UUID NOT NULL,
  tenant_id VARCHAR(255) NOT NULL,

  -- Override Details
  from_grade VARCHAR(10) NOT NULL,
  to_grade VARCHAR(10) NOT NULL,
  completion_at_override DECIMAL(5,2) NOT NULL,
  override_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Reason and Skills
  reason TEXT,
  skills_incomplete JSONB DEFAULT '[]',
  skills_to_remediate INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- No updates allowed on audit records
  CONSTRAINT no_update_audit CHECK (created_at = created_at)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_override_student
  ON parent_override_audit(student_id);

CREATE INDEX IF NOT EXISTS idx_override_parent
  ON parent_override_audit(parent_id);

CREATE INDEX IF NOT EXISTS idx_override_date
  ON parent_override_audit(override_date DESC);

-- =====================================================
-- 7. ANALYTICS VIEWS (For PathIQ)
-- =====================================================

-- Career Usage Analytics View
CREATE OR REPLACE VIEW career_analytics AS
SELECT
  tenant_id,
  career,
  grade_level,
  school_year,
  COUNT(DISTINCT user_id) as student_count,
  AVG(completion_percentage) as avg_completion,
  AVG(time_spent_minutes) as avg_time_spent,
  COUNT(DISTINCT user_id) FILTER (WHERE advanced_early = TRUE) as advanced_early_count,
  MAX(last_accessed) as last_activity
FROM learning_journeys
WHERE career IS NOT NULL
GROUP BY tenant_id, career, grade_level, school_year;

-- Companion Usage Analytics View
CREATE OR REPLACE VIEW companion_analytics AS
SELECT
  tenant_id,
  companion,
  grade_level,
  school_year,
  COUNT(DISTINCT user_id) as student_count,
  AVG(completion_percentage) as avg_completion,
  AVG(streak_days) as avg_streak,
  SUM(time_spent_minutes) as total_time_spent,
  MAX(last_accessed) as last_activity
FROM learning_journeys
WHERE companion IS NOT NULL
GROUP BY tenant_id, companion, grade_level, school_year;

-- Grade Progression Analytics View
CREATE OR REPLACE VIEW grade_progression_analytics AS
SELECT
  tenant_id,
  grade_level,
  school_year,
  COUNT(DISTINCT user_id) as total_students,
  COUNT(DISTINCT user_id) FILTER (WHERE completed_date IS NOT NULL) as completed_students,
  COUNT(DISTINCT user_id) FILTER (WHERE advanced_early = TRUE) as advanced_early_students,
  AVG(completion_percentage) as avg_completion,
  COUNT(DISTINCT user_id) FILTER (WHERE advancement_by = 'parent_override') as parent_override_count,
  COUNT(DISTINCT user_id) FILTER (WHERE advancement_by = 'student_completion') as student_completion_count
FROM grade_progression_tracking
GROUP BY tenant_id, grade_level, school_year;

-- =====================================================
-- 8. HELPER FUNCTIONS
-- =====================================================

-- Function to calculate streak days
CREATE OR REPLACE FUNCTION calculate_streak_days(p_user_id UUID, p_tenant_id VARCHAR, p_grade_level VARCHAR)
RETURNS INTEGER AS $$
DECLARE
  v_last_active DATE;
  v_streak_days INTEGER;
  v_days_diff INTEGER;
BEGIN
  SELECT last_active_date, streak_days
  INTO v_last_active, v_streak_days
  FROM learning_journeys
  WHERE user_id = p_user_id
    AND tenant_id = p_tenant_id
    AND grade_level = p_grade_level
  ORDER BY updated_at DESC
  LIMIT 1;

  IF v_last_active IS NULL THEN
    RETURN 0;
  END IF;

  v_days_diff := CURRENT_DATE - v_last_active;

  IF v_days_diff > 1 THEN
    RETURN 0;  -- Streak broken
  ELSE
    RETURN COALESCE(v_streak_days, 1);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to handle parent override
CREATE OR REPLACE FUNCTION process_parent_override(
  p_student_id UUID,
  p_parent_id UUID,
  p_tenant_id VARCHAR,
  p_from_grade VARCHAR,
  p_to_grade VARCHAR,
  p_completion_percentage DECIMAL,
  p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Insert into audit log
  INSERT INTO parent_override_audit (
    student_id, parent_id, tenant_id, from_grade, to_grade,
    completion_at_override, reason
  ) VALUES (
    p_student_id, p_parent_id, p_tenant_id, p_from_grade, p_to_grade,
    p_completion_percentage, p_reason
  );

  -- Update grade progression
  UPDATE grade_progression_tracking
  SET
    advanced_early = TRUE,
    advancement_date = NOW(),
    advancement_by = 'parent_override',
    advancement_reason = p_reason,
    parent_id = p_parent_id,
    override_completion_percentage = p_completion_percentage
  WHERE user_id = p_student_id
    AND tenant_id = p_tenant_id
    AND grade_level = p_from_grade;

  -- Update learning journey
  UPDATE learning_journeys
  SET
    advanced_early = TRUE,
    grade_level = p_to_grade,
    updated_at = NOW()
  WHERE user_id = p_student_id
    AND tenant_id = p_tenant_id
    AND grade_level = p_from_grade;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE learning_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_progression_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_authority_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE remediation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_sync_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_override_audit ENABLE ROW LEVEL SECURITY;

-- Policies for learning_journeys
CREATE POLICY "Users can view own journeys" ON learning_journeys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own journeys" ON learning_journeys
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own journeys" ON learning_journeys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for tenant admins (can view all in their tenant)
-- Note: This policy assumes you have a users or profiles table with role and tenant_id
-- Uncomment and modify based on your actual user/profile table structure
/*
CREATE POLICY "Tenant admins can view tenant journeys" ON learning_journeys
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM your_users_or_profiles_table
      WHERE your_users_or_profiles_table.id = auth.uid()
      AND your_users_or_profiles_table.role IN ('district_admin', 'school_admin', 'teacher')
      AND your_users_or_profiles_table.tenant_id = learning_journeys.tenant_id
    )
  );
*/

-- Similar policies for other tables...
-- (Add similar RLS policies for each table based on your auth structure)

-- =====================================================
-- 10. TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at column
CREATE TRIGGER update_learning_journeys_updated_at BEFORE UPDATE ON learning_journeys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grade_progression_updated_at BEFORE UPDATE ON grade_progression_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skill_authority_updated_at BEFORE UPDATE ON skill_authority_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_remediation_queue_updated_at BEFORE UPDATE ON remediation_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sync_metadata_updated_at BEFORE UPDATE ON journey_sync_metadata
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Add comments for documentation
COMMENT ON TABLE learning_journeys IS 'Main table tracking user learning journeys with career and companion selections';
COMMENT ON TABLE grade_progression_tracking IS 'Tracks student progression through grades including parent overrides';
COMMENT ON TABLE skill_authority_tracking IS 'Records who completed each skill (student or parent override)';
COMMENT ON TABLE remediation_queue IS 'Queue of incomplete skills that need remediation';
COMMENT ON TABLE journey_sync_metadata IS 'Metadata for cross-device synchronization';
COMMENT ON TABLE parent_override_audit IS 'Immutable audit log of all parent override actions';

COMMENT ON VIEW career_analytics IS 'Aggregated analytics for PathIQ career usage reporting';
COMMENT ON VIEW companion_analytics IS 'Aggregated analytics for PathIQ companion usage reporting';
COMMENT ON VIEW grade_progression_analytics IS 'Aggregated analytics for grade progression patterns';