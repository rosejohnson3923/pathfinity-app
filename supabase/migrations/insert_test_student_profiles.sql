-- ================================================================
-- INSERT TEST STUDENT PROFILES FOR MOCK AUTH USERS
-- Run this script in Supabase SQL Editor to create matching profiles
-- ================================================================

-- Insert student profiles for the mock auth users
-- This ensures the database has matching records for authentication
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
  -- Alex Davis (Grade 1) - Sand View Elementary
  (
    'test_user_alex_sandview'::uuid,
    'Alex',
    'Davis',
    'Alex',
    '1',
    '2018-09-15'::date,
    '{
      "learning_style": "kinesthetic",
      "favorite_subjects": ["Math", "Science"],
      "attention_span": "medium",
      "prefers_hands_on": true,
      "session_length_preference": 20,
      "best_time_of_day": "morning"
    }'::jsonb,
    'alex.davis@sandview.plainviewisd.edu',
    'sand-view-elementary-school-001'
  ),
  -- Sam Brown (Grade K) - Sand View Elementary  
  (
    'test_user_sam_sandview'::uuid,
    'Sam',
    'Brown',
    'Sam',
    'K',
    '2019-04-22'::date,
    '{
      "learning_style": "visual",
      "favorite_subjects": ["Math", "Art"],
      "attention_span": "short",
      "prefers_hands_on": true,
      "session_length_preference": 15,
      "best_time_of_day": "morning"
    }'::jsonb,
    'sam.brown@sandview.plainviewisd.edu',
    'sand-view-elementary-school-001'
  ),
  -- Jordan Smith (Grade 7) - Ocean View Middle
  (
    'test_user_jordan_oceanview'::uuid,
    'Jordan',
    'Smith',
    'Jordan',
    '7',
    '2012-11-08'::date,
    '{
      "learning_style": "mixed",
      "favorite_subjects": ["Science", "Technology"],
      "attention_span": "long",
      "prefers_hands_on": false,
      "session_length_preference": 30,
      "best_time_of_day": "afternoon"
    }'::jsonb,
    'jordan.smith@oceanview.plainviewisd.edu',
    'ocean-view-middle-school-001'
  ),
  -- Taylor Johnson (Grade 10) - City View High
  (
    'test_user_taylor_cityview'::uuid,
    'Taylor',
    'Johnson',
    'Taylor',
    '10',
    '2009-06-12'::date,
    '{
      "learning_style": "auditory",
      "favorite_subjects": ["Mathematics", "Physics"],
      "attention_span": "long",
      "prefers_hands_on": false,
      "session_length_preference": 45,
      "best_time_of_day": "afternoon"
    }'::jsonb,
    'taylor.johnson@cityview.plainviewisd.edu',
    'city-view-high-school-001'
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

-- Verify the inserts
SELECT 
  user_id,
  display_name,
  grade_level,
  school_id,
  is_active
FROM student_profiles 
WHERE user_id IN (
  'test_user_alex_sandview'::uuid,
  'test_user_sam_sandview'::uuid, 
  'test_user_jordan_oceanview'::uuid,
  'test_user_taylor_cityview'::uuid
)
ORDER BY grade_level;