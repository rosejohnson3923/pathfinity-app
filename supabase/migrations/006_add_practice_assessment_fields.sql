-- Add practice/assessment breakdown fields to container_sessions
-- This allows us to distinguish between practice and assessment performance

ALTER TABLE container_sessions
ADD COLUMN IF NOT EXISTS practice_questions_attempted INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS practice_questions_correct INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS assessment_questions_attempted INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS assessment_questions_correct INTEGER DEFAULT 0;

-- Add comments for clarity
COMMENT ON COLUMN container_sessions.practice_questions_attempted IS 'Number of practice questions attempted';
COMMENT ON COLUMN container_sessions.practice_questions_correct IS 'Number of practice questions answered correctly';
COMMENT ON COLUMN container_sessions.assessment_questions_attempted IS 'Number of assessment questions attempted';
COMMENT ON COLUMN container_sessions.assessment_questions_correct IS 'Number of assessment questions answered correctly';

-- Note: questions_attempted and questions_correct remain as totals for backward compatibility
