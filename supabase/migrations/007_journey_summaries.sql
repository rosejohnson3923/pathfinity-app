-- ================================================================
-- Journey Summaries Migration
-- Overall session summaries for lesson plans and summary screen
-- ================================================================

-- ================================================================
-- 1. JOURNEY SUMMARIES TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS journey_summaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Session Identification
  user_id UUID NOT NULL,
  tenant_id VARCHAR(255) NOT NULL,
  session_id VARCHAR(255) NOT NULL UNIQUE,

  -- Student Context
  student_name VARCHAR(255) NOT NULL,
  grade_level VARCHAR(10) NOT NULL,

  -- Career & Companion
  career_id VARCHAR(100) NOT NULL,
  career_name VARCHAR(255) NOT NULL,
  career_icon VARCHAR(50),
  companion_id VARCHAR(100) NOT NULL,
  companion_name VARCHAR(255) NOT NULL,

  -- Overall Metrics
  total_xp_earned INTEGER DEFAULT 0 CHECK (total_xp_earned >= 0),
  total_time_spent INTEGER DEFAULT 0 CHECK (total_time_spent >= 0), -- seconds
  overall_score DECIMAL(5,2) DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
  skills_mastered INTEGER DEFAULT 0 CHECK (skills_mastered >= 0),
  skills_attempted INTEGER DEFAULT 0 CHECK (skills_attempted >= 0),

  -- Container Progress (JSONB for flexibility)
  learn_progress JSONB DEFAULT '{}',
  experience_progress JSONB DEFAULT '{}',
  discover_progress JSONB DEFAULT '{}',
  -- Example structure:
  -- {
  --   "subjects": [
  --     {
  --       "subject": "Math",
  --       "skillName": "Basic Addition",
  --       "skillId": "K.Math.A.1",
  --       "score": 85,
  --       "questionsAttempted": 10,
  --       "questionsCorrect": 8,
  --       "timeSpent": 300,
  --       "xpEarned": 50,
  --       "completed": true
  --     }
  --   ],
  --   "averageScore": 82.5,
  --   "totalXP": 200,
  --   "totalTime": 1200
  -- }

  -- Session Timeline
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,

  -- Completion Status
  completed BOOLEAN DEFAULT false,
  completed_containers INTEGER DEFAULT 0 CHECK (completed_containers >= 0 AND completed_containers <= 3),

  -- Lesson Plan Generation
  lesson_plan_generated BOOLEAN DEFAULT false,
  lesson_plan_generated_at TIMESTAMPTZ,
  lesson_plan_url TEXT, -- Azure Blob Storage URL

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_skills CHECK (skills_mastered <= skills_attempted),
  CONSTRAINT valid_completion CHECK (
    (completed = false AND end_time IS NULL) OR
    (completed = true AND end_time IS NOT NULL)
  )
);

-- ================================================================
-- 2. INDEXES FOR PERFORMANCE
-- ================================================================

-- Primary lookup patterns
CREATE INDEX IF NOT EXISTS idx_journey_summaries_user
  ON journey_summaries(user_id, start_time DESC);

CREATE INDEX IF NOT EXISTS idx_journey_summaries_session
  ON journey_summaries(session_id);

CREATE INDEX IF NOT EXISTS idx_journey_summaries_tenant
  ON journey_summaries(tenant_id, start_time DESC);

-- Analytics queries
CREATE INDEX IF NOT EXISTS idx_journey_summaries_grade
  ON journey_summaries(grade_level, career_id, completed);

CREATE INDEX IF NOT EXISTS idx_journey_summaries_career
  ON journey_summaries(career_id, completed)
  WHERE completed = true;

CREATE INDEX IF NOT EXISTS idx_journey_summaries_completion
  ON journey_summaries(completed, end_time DESC);

CREATE INDEX IF NOT EXISTS idx_journey_summaries_lesson_plan
  ON journey_summaries(lesson_plan_generated)
  WHERE lesson_plan_generated = true;

-- ================================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ================================================================

ALTER TABLE journey_summaries ENABLE ROW LEVEL SECURITY;

-- Users can view own journey summaries
CREATE POLICY "Users can view own journey summaries"
  ON journey_summaries
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert own journey summaries
CREATE POLICY "Users can insert own journey summaries"
  ON journey_summaries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update own journey summaries
CREATE POLICY "Users can update own journey summaries"
  ON journey_summaries
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Parents can view their children's summaries
-- Note: Uncomment and modify based on your family relationships table
/*
CREATE POLICY "Parents can view children journey summaries"
  ON journey_summaries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_relationships
      WHERE family_relationships.parent_id = auth.uid()
        AND family_relationships.child_id = journey_summaries.user_id
    )
  );
*/

-- ================================================================
-- 4. TRIGGERS
-- ================================================================

-- Update updated_at timestamp
CREATE TRIGGER update_journey_summaries_updated_at
  BEFORE UPDATE ON journey_summaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-calculate overall metrics from container progress
CREATE OR REPLACE FUNCTION calculate_journey_metrics()
RETURNS TRIGGER AS $$
DECLARE
  v_total_xp INTEGER := 0;
  v_total_time INTEGER := 0;
  v_total_score DECIMAL := 0;
  v_subject_count INTEGER := 0;
BEGIN
  -- Extract from LEARN progress
  IF NEW.learn_progress IS NOT NULL AND jsonb_typeof(NEW.learn_progress) = 'object' THEN
    v_total_xp := v_total_xp + COALESCE((NEW.learn_progress->>'totalXP')::INTEGER, 0);
    v_total_time := v_total_time + COALESCE((NEW.learn_progress->>'totalTime')::INTEGER, 0);

    IF (NEW.learn_progress->>'averageScore') IS NOT NULL THEN
      v_total_score := v_total_score + (NEW.learn_progress->>'averageScore')::DECIMAL;
      v_subject_count := v_subject_count + 1;
    END IF;
  END IF;

  -- Extract from EXPERIENCE progress
  IF NEW.experience_progress IS NOT NULL AND jsonb_typeof(NEW.experience_progress) = 'object' THEN
    v_total_xp := v_total_xp + COALESCE((NEW.experience_progress->>'totalXP')::INTEGER, 0);
    v_total_time := v_total_time + COALESCE((NEW.experience_progress->>'totalTime')::INTEGER, 0);

    IF (NEW.experience_progress->>'averageScore') IS NOT NULL THEN
      v_total_score := v_total_score + (NEW.experience_progress->>'averageScore')::DECIMAL;
      v_subject_count := v_subject_count + 1;
    END IF;
  END IF;

  -- Extract from DISCOVER progress
  IF NEW.discover_progress IS NOT NULL AND jsonb_typeof(NEW.discover_progress) = 'object' THEN
    v_total_xp := v_total_xp + COALESCE((NEW.discover_progress->>'totalXP')::INTEGER, 0);
    v_total_time := v_total_time + COALESCE((NEW.discover_progress->>'totalTime')::INTEGER, 0);

    IF (NEW.discover_progress->>'averageScore') IS NOT NULL THEN
      v_total_score := v_total_score + (NEW.discover_progress->>'averageScore')::DECIMAL;
      v_subject_count := v_subject_count + 1;
    END IF;
  END IF;

  -- Update calculated fields
  NEW.total_xp_earned := v_total_xp;
  NEW.total_time_spent := v_total_time;

  IF v_subject_count > 0 THEN
    NEW.overall_score := ROUND((v_total_score / v_subject_count)::NUMERIC, 2);
  END IF;

  -- Update completed containers count
  NEW.completed_containers :=
    (CASE WHEN jsonb_array_length(COALESCE(NEW.learn_progress->'subjects', '[]'::jsonb)) > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN jsonb_array_length(COALESCE(NEW.experience_progress->'subjects', '[]'::jsonb)) > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN jsonb_array_length(COALESCE(NEW.discover_progress->'subjects', '[]'::jsonb)) > 0 THEN 1 ELSE 0 END);

  -- Mark as completed if all 3 containers done
  IF NEW.completed_containers = 3 AND NEW.completed = false THEN
    NEW.completed := true;
    NEW.end_time := NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_journey_metrics_trigger
  BEFORE INSERT OR UPDATE ON journey_summaries
  FOR EACH ROW
  EXECUTE FUNCTION calculate_journey_metrics();

-- ================================================================
-- 5. HELPER FUNCTIONS
-- ================================================================

-- Create or update journey summary
CREATE OR REPLACE FUNCTION upsert_journey_summary(
  p_user_id UUID,
  p_tenant_id VARCHAR(255),
  p_session_id VARCHAR(255),
  p_student_name VARCHAR(255),
  p_grade_level VARCHAR(10),
  p_career_id VARCHAR(100),
  p_career_name VARCHAR(255),
  p_companion_id VARCHAR(100),
  p_companion_name VARCHAR(255)
)
RETURNS UUID AS $$
DECLARE
  v_summary_id UUID;
BEGIN
  INSERT INTO journey_summaries (
    user_id, tenant_id, session_id,
    student_name, grade_level,
    career_id, career_name,
    companion_id, companion_name,
    start_time
  )
  VALUES (
    p_user_id, p_tenant_id, p_session_id,
    p_student_name, p_grade_level,
    p_career_id, p_career_name,
    p_companion_id, p_companion_name,
    NOW()
  )
  ON CONFLICT (session_id) DO UPDATE
  SET
    updated_at = NOW()
  RETURNING id INTO v_summary_id;

  RETURN v_summary_id;
END;
$$ LANGUAGE plpgsql;

-- Update container progress
CREATE OR REPLACE FUNCTION update_container_progress(
  p_session_id VARCHAR(255),
  p_container VARCHAR(20),
  p_progress JSONB
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE journey_summaries
  SET
    learn_progress = CASE WHEN p_container = 'LEARN' THEN p_progress ELSE learn_progress END,
    experience_progress = CASE WHEN p_container = 'EXPERIENCE' THEN p_progress ELSE experience_progress END,
    discover_progress = CASE WHEN p_container = 'DISCOVER' THEN p_progress ELSE discover_progress END,
    updated_at = NOW()
  WHERE session_id = p_session_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Get journey summary with container details
CREATE OR REPLACE FUNCTION get_journey_summary_detailed(
  p_session_id VARCHAR(255)
)
RETURNS TABLE (
  session_id VARCHAR(255),
  student_name VARCHAR(255),
  grade_level VARCHAR(10),
  career_name VARCHAR(255),
  companion_name VARCHAR(255),
  total_xp_earned INTEGER,
  total_time_spent INTEGER,
  overall_score DECIMAL(5,2),
  learn_subjects JSONB,
  experience_subjects JSONB,
  discover_subjects JSONB,
  completed BOOLEAN,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    js.session_id,
    js.student_name,
    js.grade_level,
    js.career_name,
    js.companion_name,
    js.total_xp_earned,
    js.total_time_spent,
    js.overall_score,
    COALESCE(js.learn_progress->'subjects', '[]'::jsonb) AS learn_subjects,
    COALESCE(js.experience_progress->'subjects', '[]'::jsonb) AS experience_subjects,
    COALESCE(js.discover_progress->'subjects', '[]'::jsonb) AS discover_subjects,
    js.completed,
    js.start_time,
    js.end_time
  FROM journey_summaries js
  WHERE js.session_id = p_session_id;
END;
$$ LANGUAGE plpgsql;

-- Mark lesson plan as generated
CREATE OR REPLACE FUNCTION mark_lesson_plan_generated(
  p_session_id VARCHAR(255),
  p_lesson_plan_url TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE journey_summaries
  SET
    lesson_plan_generated = true,
    lesson_plan_generated_at = NOW(),
    lesson_plan_url = p_lesson_plan_url,
    updated_at = NOW()
  WHERE session_id = p_session_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- 6. ANALYTICS VIEWS
-- ================================================================

CREATE OR REPLACE VIEW journey_completion_analytics AS
SELECT
  js.tenant_id,
  js.grade_level,
  js.career_id,
  COUNT(*) AS total_journeys,
  COUNT(*) FILTER (WHERE js.completed = true) AS completed_journeys,
  ROUND(
    (COUNT(*) FILTER (WHERE js.completed = true)::DECIMAL / NULLIF(COUNT(*), 0)) * 100,
    2
  ) AS completion_rate,
  AVG(js.overall_score) FILTER (WHERE js.completed = true) AS avg_score,
  AVG(js.total_time_spent) FILTER (WHERE js.completed = true) AS avg_time_spent,
  AVG(js.total_xp_earned) FILTER (WHERE js.completed = true) AS avg_xp_earned,
  AVG(EXTRACT(EPOCH FROM (js.end_time - js.start_time)) / 3600) FILTER (WHERE js.completed = true) AS avg_hours_to_complete
FROM journey_summaries js
GROUP BY js.tenant_id, js.grade_level, js.career_id;

CREATE OR REPLACE VIEW lesson_plan_analytics AS
SELECT
  js.tenant_id,
  js.grade_level,
  COUNT(*) AS total_completed_journeys,
  COUNT(*) FILTER (WHERE js.lesson_plan_generated = true) AS lesson_plans_generated,
  ROUND(
    (COUNT(*) FILTER (WHERE js.lesson_plan_generated = true)::DECIMAL / NULLIF(COUNT(*), 0)) * 100,
    2
  ) AS generation_rate,
  AVG(EXTRACT(EPOCH FROM (js.lesson_plan_generated_at - js.end_time)) / 3600)
    FILTER (WHERE js.lesson_plan_generated = true) AS avg_hours_until_generated
FROM journey_summaries js
WHERE js.completed = true
GROUP BY js.tenant_id, js.grade_level;

-- ================================================================
-- 7. COMMENTS
-- ================================================================

COMMENT ON TABLE journey_summaries IS 'Overall summaries of learning journeys for lesson plan generation and summary screen';
COMMENT ON COLUMN journey_summaries.learn_progress IS 'JSONB containing LEARN container progress with subjects array';
COMMENT ON COLUMN journey_summaries.lesson_plan_url IS 'Azure Blob Storage URL for generated lesson plan PDF';
COMMENT ON FUNCTION upsert_journey_summary IS 'Create or update journey summary (idempotent)';
COMMENT ON FUNCTION update_container_progress IS 'Update progress for a specific container (LEARN, EXPERIENCE, DISCOVER)';
COMMENT ON FUNCTION get_journey_summary_detailed IS 'Retrieve complete journey summary with all container details';
COMMENT ON VIEW journey_completion_analytics IS 'Analytics on journey completion rates by tenant, grade, and career';
COMMENT ON VIEW lesson_plan_analytics IS 'Analytics on lesson plan generation rates';

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================
