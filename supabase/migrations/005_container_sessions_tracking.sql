-- ================================================================
-- Container Sessions Tracking Migration
-- Detailed tracking for LEARN, EXPERIENCE, DISCOVER containers
-- ================================================================

-- ================================================================
-- 1. CONTAINER SESSIONS TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS container_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Session Identification
  user_id UUID NOT NULL,
  tenant_id VARCHAR(255) NOT NULL,
  session_id VARCHAR(255) NOT NULL, -- Links to journey_summaries

  -- Container & Subject Info
  container VARCHAR(20) NOT NULL CHECK (container IN ('LEARN', 'EXPERIENCE', 'DISCOVER')),
  subject VARCHAR(50) NOT NULL CHECK (subject IN ('Math', 'ELA', 'Science', 'Social Studies')),
  skill_id VARCHAR(100) NOT NULL,
  skill_name VARCHAR(255) NOT NULL,
  grade_level VARCHAR(10) NOT NULL,

  -- Performance Metrics
  questions_attempted INTEGER DEFAULT 0,
  questions_correct INTEGER DEFAULT 0,
  score DECIMAL(5,2) DEFAULT 0, -- Percentage score
  time_spent INTEGER DEFAULT 0, -- Seconds
  attempts INTEGER DEFAULT 1,

  -- XP & Gamification
  xp_earned INTEGER DEFAULT 0,
  hints_used INTEGER DEFAULT 0,
  achievements_unlocked JSONB DEFAULT '[]',

  -- Detailed Question History (for lesson plan generation)
  question_history JSONB DEFAULT '[]',
  -- Example structure:
  -- [{
  --   "questionId": "q1",
  --   "questionText": "What is 2+2?",
  --   "studentAnswer": "4",
  --   "correctAnswer": "4",
  --   "isCorrect": true,
  --   "attemptNumber": 1,
  --   "timeSpent": 15,
  --   "hintsUsed": 0,
  --   "timestamp": "2025-10-09T19:30:00Z"
  -- }]

  -- Status
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_score CHECK (score >= 0 AND score <= 100),
  CONSTRAINT valid_questions CHECK (questions_correct <= questions_attempted)
);

-- ================================================================
-- 2. INDEXES FOR PERFORMANCE
-- ================================================================

-- Primary lookup patterns
CREATE INDEX IF NOT EXISTS idx_container_sessions_user
  ON container_sessions(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_container_sessions_session
  ON container_sessions(session_id, container, subject);

CREATE INDEX IF NOT EXISTS idx_container_sessions_tenant
  ON container_sessions(tenant_id, container, created_at DESC);

-- Analytics queries
CREATE INDEX IF NOT EXISTS idx_container_sessions_subject
  ON container_sessions(subject, grade_level, score);

CREATE INDEX IF NOT EXISTS idx_container_sessions_skill
  ON container_sessions(skill_id, completed);

CREATE INDEX IF NOT EXISTS idx_container_sessions_xp
  ON container_sessions(user_id, xp_earned)
  WHERE completed = true;

-- Composite index for common query pattern
CREATE INDEX IF NOT EXISTS idx_container_sessions_composite
  ON container_sessions(tenant_id, user_id, container, subject, created_at DESC);

-- ================================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ================================================================

ALTER TABLE container_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view own sessions
CREATE POLICY "Users can view own container sessions"
  ON container_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert own sessions
CREATE POLICY "Users can insert own container sessions"
  ON container_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update own sessions
CREATE POLICY "Users can update own container sessions"
  ON container_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Tenant admins can view all sessions in their tenant
-- Note: Uncomment and modify based on your user roles table
/*
CREATE POLICY "Tenant admins can view tenant container sessions"
  ON container_sessions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('district_admin', 'school_admin', 'teacher')
        AND profiles.tenant_id = container_sessions.tenant_id
    )
  );
*/

-- ================================================================
-- 4. TRIGGERS
-- ================================================================

-- Update updated_at timestamp
CREATE TRIGGER update_container_sessions_updated_at
  BEFORE UPDATE ON container_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- 5. HELPER FUNCTIONS
-- ================================================================

-- Calculate average score for a user in a specific container
CREATE OR REPLACE FUNCTION get_user_container_average(
  p_user_id UUID,
  p_container VARCHAR(20),
  p_session_id VARCHAR(255) DEFAULT NULL
)
RETURNS DECIMAL AS $$
DECLARE
  v_avg_score DECIMAL;
BEGIN
  SELECT AVG(score)
  INTO v_avg_score
  FROM container_sessions
  WHERE user_id = p_user_id
    AND container = p_container
    AND completed = true
    AND (p_session_id IS NULL OR session_id = p_session_id);

  RETURN COALESCE(v_avg_score, 0);
END;
$$ LANGUAGE plpgsql;

-- Get total XP earned by user in a session
CREATE OR REPLACE FUNCTION get_session_total_xp(
  p_user_id UUID,
  p_session_id VARCHAR(255)
)
RETURNS INTEGER AS $$
DECLARE
  v_total_xp INTEGER;
BEGIN
  SELECT SUM(xp_earned)
  INTO v_total_xp
  FROM container_sessions
  WHERE user_id = p_user_id
    AND session_id = p_session_id
    AND completed = true;

  RETURN COALESCE(v_total_xp, 0);
END;
$$ LANGUAGE plpgsql;

-- Get subject breakdown for a container
CREATE OR REPLACE FUNCTION get_container_subject_breakdown(
  p_user_id UUID,
  p_session_id VARCHAR(255),
  p_container VARCHAR(20)
)
RETURNS TABLE (
  subject VARCHAR(50),
  score DECIMAL(5,2),
  questions_correct INTEGER,
  questions_attempted INTEGER,
  xp_earned INTEGER,
  time_spent INTEGER,
  completed BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cs.subject,
    cs.score,
    cs.questions_correct,
    cs.questions_attempted,
    cs.xp_earned,
    cs.time_spent,
    cs.completed
  FROM container_sessions cs
  WHERE cs.user_id = p_user_id
    AND cs.session_id = p_session_id
    AND cs.container = p_container
  ORDER BY
    CASE cs.subject
      WHEN 'Math' THEN 1
      WHEN 'ELA' THEN 2
      WHEN 'Science' THEN 3
      WHEN 'Social Studies' THEN 4
    END;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- 6. ANALYTICS VIEW
-- ================================================================

CREATE OR REPLACE VIEW container_performance_analytics AS
SELECT
  cs.tenant_id,
  cs.container,
  cs.subject,
  cs.grade_level,
  COUNT(DISTINCT cs.user_id) AS unique_students,
  COUNT(*) AS total_sessions,
  AVG(cs.score) AS avg_score,
  AVG(cs.questions_correct::DECIMAL / NULLIF(cs.questions_attempted, 0) * 100) AS avg_accuracy,
  AVG(cs.time_spent) AS avg_time_spent,
  SUM(cs.xp_earned) AS total_xp_earned,
  AVG(cs.hints_used) AS avg_hints_used,
  COUNT(*) FILTER (WHERE cs.completed = true) AS completed_sessions,
  ROUND(
    (COUNT(*) FILTER (WHERE cs.completed = true)::DECIMAL / NULLIF(COUNT(*), 0)) * 100,
    2
  ) AS completion_rate
FROM container_sessions cs
GROUP BY cs.tenant_id, cs.container, cs.subject, cs.grade_level;

-- ================================================================
-- 7. COMMENTS
-- ================================================================

COMMENT ON TABLE container_sessions IS 'Detailed tracking of student performance in LEARN, EXPERIENCE, and DISCOVER containers';
COMMENT ON COLUMN container_sessions.question_history IS 'JSONB array containing detailed history of each question attempt';
COMMENT ON COLUMN container_sessions.xp_earned IS 'Total XP earned in this container session (fed to PathIQ)';
COMMENT ON VIEW container_performance_analytics IS 'Aggregated analytics for container performance by subject and grade';

-- ================================================================
-- MIGRATION COMPLETE
-- ================================================================
