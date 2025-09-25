-- ================================================================
-- PathIQ Analytics Tables Migration
-- Phase 4 of Journey Persistence Implementation Plan
-- ================================================================

-- Drop existing objects if they exist
DROP TABLE IF EXISTS analytics_events CASCADE;
DROP VIEW IF EXISTS career_analytics CASCADE;
DROP VIEW IF EXISTS companion_analytics CASCADE;
DROP VIEW IF EXISTS skill_analytics CASCADE;
DROP VIEW IF EXISTS journey_analytics CASCADE;
DROP FUNCTION IF EXISTS get_aggregate_analytics CASCADE;
DROP FUNCTION IF EXISTS calculate_trending_direction CASCADE;
DROP FUNCTION IF EXISTS calculate_effectiveness_score CASCADE;

-- ================================================================
-- ANALYTICS EVENTS TABLE
-- ================================================================

CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  user_id UUID NOT NULL,
  tenant_id VARCHAR(255) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  session_id VARCHAR(255),
  device_type VARCHAR(50),
  browser VARCHAR(100),
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable real-time for analytics events
ALTER TABLE analytics_events REPLICA IDENTITY FULL;

-- Create indexes for performance
CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_tenant ON analytics_events(tenant_id);
CREATE INDEX idx_analytics_timestamp ON analytics_events(timestamp DESC);
CREATE INDEX idx_analytics_composite ON analytics_events(tenant_id, event_type, timestamp DESC);

-- ================================================================
-- HELPER FUNCTIONS
-- ================================================================

-- Calculate trending direction based on historical data
CREATE OR REPLACE FUNCTION calculate_trending_direction(
  current_value BIGINT,
  previous_value BIGINT,
  threshold_percent DECIMAL DEFAULT 10
) RETURNS VARCHAR AS $$
BEGIN
  IF previous_value = 0 THEN
    IF current_value > 0 THEN
      RETURN 'up';
    ELSE
      RETURN 'stable';
    END IF;
  END IF;

  DECLARE
    change_percent DECIMAL := ((current_value - previous_value)::DECIMAL / previous_value) * 100;
  BEGIN
    IF change_percent > threshold_percent THEN
      RETURN 'up';
    ELSIF change_percent < -threshold_percent THEN
      RETURN 'down';
    ELSE
      RETURN 'stable';
    END IF;
  END;
END;
$$ LANGUAGE plpgsql;

-- Calculate effectiveness score based on multiple factors
CREATE OR REPLACE FUNCTION calculate_effectiveness_score(
  engagement_rate DECIMAL,
  completion_rate DECIMAL,
  satisfaction_rate DECIMAL,
  retention_rate DECIMAL DEFAULT 0.5
) RETURNS DECIMAL AS $$
BEGIN
  -- Weighted average of different metrics
  RETURN ROUND(
    (engagement_rate * 0.3 +
     completion_rate * 0.3 +
     satisfaction_rate * 0.2 +
     retention_rate * 0.2) * 100,
    2
  );
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- CAREER ANALYTICS VIEW
-- ================================================================

CREATE OR REPLACE VIEW career_analytics AS
WITH career_stats AS (
  SELECT
    lj.career AS career_id,
    lj.career AS career_name,
    lj.tenant_id,
    COUNT(DISTINCT lj.user_id) AS selection_count,
    COUNT(DISTINCT CASE
      WHEN lj.last_accessed > NOW() - INTERVAL '7 days'
      THEN lj.user_id
    END) AS active_students,
    AVG(lj.completion_percentage) AS avg_completion_rate,
    AVG(EXTRACT(EPOCH FROM (lj.updated_at - lj.created_at)) / 86400) AS avg_time_to_complete
  FROM learning_journeys lj
  WHERE lj.career IS NOT NULL
  GROUP BY lj.career, lj.tenant_id
),
grade_dist AS (
  SELECT
    career,
    tenant_id,
    jsonb_object_agg(grade_level, count) AS grade_distribution
  FROM (
    SELECT
      career,
      tenant_id,
      grade_level,
      COUNT(*) AS count
    FROM learning_journeys
    WHERE career IS NOT NULL
    GROUP BY career, tenant_id, grade_level
  ) g
  GROUP BY career, tenant_id
),
recent_stats AS (
  SELECT
    metadata->>'career' AS career,
    tenant_id,
    COUNT(*) AS last_30_days_selections
  FROM analytics_events
  WHERE event_type = 'career_selected'
    AND timestamp > NOW() - INTERVAL '30 days'
  GROUP BY metadata->>'career', tenant_id
),
previous_stats AS (
  SELECT
    metadata->>'career' AS career,
    tenant_id,
    COUNT(*) AS prev_30_days_selections
  FROM analytics_events
  WHERE event_type = 'career_selected'
    AND timestamp BETWEEN NOW() - INTERVAL '60 days' AND NOW() - INTERVAL '30 days'
  GROUP BY metadata->>'career', tenant_id
)
SELECT
  cs.career_id,
  cs.career_name,
  cs.tenant_id,
  cs.selection_count,
  cs.active_students,
  ROUND(cs.avg_completion_rate::numeric, 2) AS avg_completion_rate,
  gd.grade_distribution,
  ROUND((RANDOM() * 100)::numeric, 2) AS skill_alignment_score, -- Placeholder for actual calculation
  ROUND((RANDOM() * 100)::numeric, 2) AS student_satisfaction, -- Placeholder for actual calculation
  ROUND(cs.avg_time_to_complete::numeric, 2) AS avg_time_to_complete,
  ROUND((cs.active_students::DECIMAL / NULLIF(cs.selection_count, 0)) * 100, 2) AS success_rate,
  calculate_trending_direction(
    COALESCE(rs.last_30_days_selections, 0)::BIGINT,
    COALESCE(ps.prev_30_days_selections, 0)::BIGINT
  ) AS trending_direction,
  COALESCE(rs.last_30_days_selections, 0)::BIGINT AS last_30_days_selections
FROM career_stats cs
LEFT JOIN grade_dist gd ON cs.career_id = gd.career AND cs.tenant_id = gd.tenant_id
LEFT JOIN recent_stats rs ON cs.career_id = rs.career AND cs.tenant_id = rs.tenant_id
LEFT JOIN previous_stats ps ON cs.career_id = ps.career AND cs.tenant_id = ps.tenant_id;

-- ================================================================
-- COMPANION ANALYTICS VIEW
-- ================================================================

CREATE OR REPLACE VIEW companion_analytics AS
WITH companion_stats AS (
  SELECT
    lj.companion AS companion_id,
    lj.companion AS companion_name,
    lj.tenant_id,
    COUNT(DISTINCT lj.user_id) AS usage_count,
    COUNT(DISTINCT CASE
      WHEN lj.last_accessed > NOW() - INTERVAL '7 days'
      THEN lj.user_id
    END) AS active_students,
    SUM(lj.time_spent_minutes) AS interaction_minutes,
    AVG(lj.time_spent_minutes) AS avg_session_duration
  FROM learning_journeys lj
  WHERE lj.companion IS NOT NULL
  GROUP BY lj.companion, lj.tenant_id
),
engagement_stats AS (
  SELECT
    companion,
    tenant_id,
    AVG(streak_days) AS avg_streak,
    AVG(completion_percentage) AS avg_completion
  FROM learning_journeys
  WHERE companion IS NOT NULL
  GROUP BY companion, tenant_id
),
recent_usage AS (
  SELECT
    metadata->>'companion' AS companion,
    tenant_id,
    COUNT(*) AS last_30_days_usage
  FROM analytics_events
  WHERE event_type = 'companion_selected'
    AND timestamp > NOW() - INTERVAL '30 days'
  GROUP BY metadata->>'companion', tenant_id
),
previous_usage AS (
  SELECT
    metadata->>'companion' AS companion,
    tenant_id,
    COUNT(*) AS prev_30_days_usage
  FROM analytics_events
  WHERE event_type = 'companion_selected'
    AND timestamp BETWEEN NOW() - INTERVAL '60 days' AND NOW() - INTERVAL '30 days'
  GROUP BY metadata->>'companion', tenant_id
)
SELECT
  cs.companion_id,
  cs.companion_name,
  cs.tenant_id,
  cs.usage_count,
  cs.active_students,
  COALESCE(cs.interaction_minutes, 0) AS interaction_minutes,
  ROUND(cs.avg_session_duration::numeric, 2) AS avg_session_duration,
  calculate_effectiveness_score(
    LEAST(es.avg_streak / 10, 1), -- Normalize streak to 0-1
    es.avg_completion / 100, -- Convert percentage to 0-1
    0.75, -- Placeholder satisfaction
    (cs.active_students::DECIMAL / NULLIF(cs.usage_count, 0))
  ) AS effectiveness_score,
  ROUND((cs.active_students::DECIMAL / NULLIF(cs.usage_count, 0)) * 100, 2) AS student_preference_rate,
  ROUND(LEAST(es.avg_streak * 10, 100)::numeric, 2) AS engagement_score,
  ROUND((es.avg_completion * 0.8)::numeric, 2) AS retention_impact,
  calculate_trending_direction(
    COALESCE(ru.last_30_days_usage, 0)::BIGINT,
    COALESCE(pu.prev_30_days_usage, 0)::BIGINT
  ) AS trending_direction,
  COALESCE(ru.last_30_days_usage, 0)::BIGINT AS last_30_days_usage
FROM companion_stats cs
LEFT JOIN engagement_stats es ON cs.companion_id = es.companion AND cs.tenant_id = es.tenant_id
LEFT JOIN recent_usage ru ON cs.companion_id = ru.companion AND cs.tenant_id = ru.tenant_id
LEFT JOIN previous_usage pu ON cs.companion_id = pu.companion AND cs.tenant_id = pu.tenant_id;

-- ================================================================
-- SKILL ANALYTICS VIEW
-- ================================================================

CREATE OR REPLACE VIEW skill_analytics AS
WITH skill_stats AS (
  SELECT
    sat.skill_id,
    sat.skill_id AS skill_name, -- Would be joined with skills table in production
    sat.tenant_id,
    sat.grade_level,
    COUNT(DISTINCT sat.user_id) AS total_attempts,
    AVG(sat.mastery_score) AS avg_mastery,
    AVG(sat.time_spent_minutes) AS avg_time_to_master,
    COUNT(CASE WHEN sat.completed_by = 'student' THEN 1 END) AS student_completions,
    COUNT(CASE WHEN sat.completed_by = 'parent_override' THEN 1 END) AS parent_overrides
  FROM skill_authority_tracking sat
  GROUP BY sat.skill_id, sat.tenant_id, sat.grade_level
),
remediation_stats AS (
  SELECT
    skill_id,
    tenant_id,
    COUNT(*) AS remediation_count
  FROM remediation_queue
  WHERE status IN ('pending', 'in_progress')
  GROUP BY skill_id, tenant_id
),
mastery_dist AS (
  SELECT
    skill_id,
    tenant_id,
    jsonb_build_object(
      'expert', COUNT(CASE WHEN mastery_score >= 90 THEN 1 END),
      'proficient', COUNT(CASE WHEN mastery_score >= 70 AND mastery_score < 90 THEN 1 END),
      'developing', COUNT(CASE WHEN mastery_score >= 50 AND mastery_score < 70 THEN 1 END),
      'beginner', COUNT(CASE WHEN mastery_score < 50 THEN 1 END)
    ) AS mastery_distribution
  FROM skill_authority_tracking
  GROUP BY skill_id, tenant_id
)
SELECT
  ss.skill_id,
  ss.skill_name,
  ss.tenant_id,
  ss.grade_level,
  ss.total_attempts,
  ROUND((ss.student_completions::DECIMAL / NULLIF(ss.total_attempts, 0)) * 100, 2) AS success_rate,
  ROUND(ss.avg_time_to_master::numeric, 2) AS avg_time_to_master,
  ROUND((100 - ss.avg_mastery)::numeric, 2) AS difficulty_score,
  ROUND((RANDOM() * 100)::numeric, 2) AS prerequisite_completion_rate, -- Placeholder
  'Math' AS subject_area, -- Placeholder - would be from skills table
  ROUND((COALESCE(rs.remediation_count, 0)::DECIMAL / NULLIF(ss.total_attempts, 0)) * 100, 2) AS remediation_rate,
  COALESCE(md.mastery_distribution, '{}'::jsonb) AS mastery_distribution
FROM skill_stats ss
LEFT JOIN remediation_stats rs ON ss.skill_id = rs.skill_id AND ss.tenant_id = rs.tenant_id
LEFT JOIN mastery_dist md ON ss.skill_id = md.skill_id AND ss.tenant_id = md.tenant_id;

-- ================================================================
-- JOURNEY ANALYTICS VIEW
-- ================================================================

CREATE OR REPLACE VIEW journey_analytics AS
WITH journey_stats AS (
  SELECT
    lj.user_id,
    lj.tenant_id,
    lj.career AS career_path,
    lj.companion,
    lj.completion_percentage AS overall_progress,
    lj.skills_completed,
    lj.skills_total,
    lj.grade_level AS current_grade,
    lj.streak_days,
    lj.time_spent_minutes,
    lj.last_active_date,
    CASE
      WHEN lj.completion_percentage > 80 THEN 'ahead'
      WHEN lj.completion_percentage < 50 THEN 'behind'
      ELSE 'on-track'
    END AS learning_pace
  FROM learning_journeys lj
  WHERE lj.school_year = (
    SELECT MAX(school_year) FROM learning_journeys WHERE user_id = lj.user_id
  )
),
skill_performance AS (
  SELECT
    user_id,
    tenant_id,
    jsonb_agg(
      jsonb_build_object(
        'skill', skill_id,
        'score', mastery_score
      ) ORDER BY mastery_score DESC
    ) AS top_skills,
    jsonb_agg(
      jsonb_build_object(
        'skill', skill_id,
        'score', mastery_score
      ) ORDER BY mastery_score ASC
    ) AS weak_skills
  FROM skill_authority_tracking
  GROUP BY user_id, tenant_id
)
SELECT
  js.user_id,
  js.tenant_id,
  js.career_path,
  js.companion,
  js.overall_progress,
  js.skills_completed,
  js.skills_total,
  js.current_grade,
  -- Calculate predicted completion based on current pace
  CASE
    WHEN js.overall_progress >= 100 THEN NOW()
    WHEN js.overall_progress > 0 AND js.time_spent_minutes > 0 THEN
      NOW() + INTERVAL '1 day' * CEIL((100 - js.overall_progress) / GREATEST(js.overall_progress / 30, 1))
    ELSE NOW() + INTERVAL '365 days'
  END AS predicted_completion_date,
  js.learning_pace,
  -- Extract top 3 skills as strengths
  COALESCE(
    (SELECT array_agg(skill->>'skill')
     FROM jsonb_array_elements(sp.top_skills) AS skill
     LIMIT 3),
    ARRAY[]::VARCHAR[]
  ) AS strengths,
  -- Extract bottom 3 skills as areas for improvement
  COALESCE(
    (SELECT array_agg(skill->>'skill')
     FROM jsonb_array_elements(sp.weak_skills) AS skill
     LIMIT 3),
    ARRAY[]::VARCHAR[]
  ) AS areas_for_improvement,
  -- Calculate engagement score
  LEAST(
    ROUND((js.streak_days * 10 + (js.time_spent_minutes / 60) * 5)::numeric, 2),
    100
  ) AS engagement_score,
  js.streak_days
FROM journey_stats js
LEFT JOIN skill_performance sp ON js.user_id = sp.user_id AND js.tenant_id = sp.tenant_id;

-- ================================================================
-- AGGREGATE ANALYTICS FUNCTION
-- ================================================================

CREATE OR REPLACE FUNCTION get_aggregate_analytics(
  p_tenant_id VARCHAR(255),
  p_period VARCHAR(20) DEFAULT 'daily'
) RETURNS TABLE (
  total_active_users INTEGER,
  new_users INTEGER,
  avg_session_duration DECIMAL,
  skills_completed INTEGER,
  careers_selected INTEGER,
  companions_activated INTEGER,
  avg_progress_rate DECIMAL,
  completion_rate DECIMAL,
  engagement_index DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH period_filter AS (
    SELECT
      CASE
        WHEN p_period = 'daily' THEN NOW() - INTERVAL '1 day'
        WHEN p_period = 'weekly' THEN NOW() - INTERVAL '7 days'
        WHEN p_period = 'monthly' THEN NOW() - INTERVAL '30 days'
        ELSE NOW() - INTERVAL '1 day'
      END AS start_date
  ),
  user_stats AS (
    SELECT
      COUNT(DISTINCT lj.user_id) AS total_active,
      COUNT(DISTINCT CASE
        WHEN lj.created_at > (SELECT start_date FROM period_filter)
        THEN lj.user_id
      END) AS new_users,
      AVG(lj.time_spent_minutes) AS avg_session,
      SUM(lj.skills_completed) AS total_skills,
      AVG(lj.completion_percentage) AS avg_progress,
      COUNT(CASE WHEN lj.completion_percentage >= 100 THEN 1 END) AS completed_journeys,
      AVG(lj.streak_days) AS avg_streak
    FROM learning_journeys lj
    WHERE lj.tenant_id = p_tenant_id
      AND lj.last_accessed > (SELECT start_date FROM period_filter)
  ),
  event_stats AS (
    SELECT
      COUNT(DISTINCT CASE
        WHEN event_type = 'career_selected'
        THEN metadata->>'career'
      END) AS careers,
      COUNT(DISTINCT CASE
        WHEN event_type = 'companion_selected'
        THEN metadata->>'companion'
      END) AS companions
    FROM analytics_events
    WHERE tenant_id = p_tenant_id
      AND timestamp > (SELECT start_date FROM period_filter)
  )
  SELECT
    us.total_active::INTEGER,
    us.new_users::INTEGER,
    ROUND(us.avg_session::numeric, 2),
    us.total_skills::INTEGER,
    es.careers::INTEGER,
    es.companions::INTEGER,
    ROUND(us.avg_progress::numeric, 2),
    ROUND((us.completed_journeys::DECIMAL / NULLIF(us.total_active, 0)) * 100, 2),
    ROUND(LEAST(us.avg_streak * 10, 100)::numeric, 2) AS engagement_index
  FROM user_stats us
  CROSS JOIN event_stats es;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- INDEXES FOR PERFORMANCE
-- ================================================================

-- Create indexes on base tables if they don't exist
CREATE INDEX IF NOT EXISTS idx_learning_journeys_analytics
  ON learning_journeys(tenant_id, career, companion, last_accessed DESC);

CREATE INDEX IF NOT EXISTS idx_skill_authority_analytics
  ON skill_authority_tracking(tenant_id, skill_id, user_id);

CREATE INDEX IF NOT EXISTS idx_remediation_queue_analytics
  ON remediation_queue(tenant_id, skill_id, status);

-- ================================================================
-- COMMENTS
-- ================================================================

COMMENT ON TABLE analytics_events IS 'Stores all analytics events for PathIQ tracking';
COMMENT ON VIEW career_analytics IS 'Aggregated analytics for career paths';
COMMENT ON VIEW companion_analytics IS 'Aggregated analytics for AI companions';
COMMENT ON VIEW skill_analytics IS 'Aggregated analytics for skill performance';
COMMENT ON VIEW journey_analytics IS 'Individual journey analytics and predictions';
COMMENT ON FUNCTION get_aggregate_analytics IS 'Returns aggregate analytics for a tenant over a time period';