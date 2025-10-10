-- Better query to see all important fields including subject and practice/assessment breakdown
SELECT
  container,
  subject,
  skill_name,
  questions_attempted,
  questions_correct,
  practice_questions_attempted,
  practice_questions_correct,
  assessment_questions_attempted,
  assessment_questions_correct,
  score,
  xp_earned,
  completed,
  created_at
FROM container_sessions
ORDER BY created_at DESC
LIMIT 10;

-- Check completed sessions with XP
SELECT
  container,
  subject,
  skill_name,
  xp_earned,
  score,
  completed_at
FROM container_sessions
WHERE completed = true
ORDER BY completed_at DESC
LIMIT 5;

-- Check PathIQ profiles
SELECT
  user_id,
  xp,
  level,
  daily_xp_earned,
  streak,
  career,
  updated_at
FROM pathiq_profiles
ORDER BY xp DESC
LIMIT 5;

-- Check XP transactions
SELECT
  user_id,
  amount,
  reason,
  container,
  subject,
  timestamp
FROM xp_transactions
ORDER BY timestamp DESC
LIMIT 10;
