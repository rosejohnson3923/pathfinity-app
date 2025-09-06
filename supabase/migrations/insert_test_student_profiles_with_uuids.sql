-- ================================================================
-- INSERT TEST STUDENT PROFILES WITH PROPER UUIDs
-- Run this script in Supabase SQL Editor to create matching profiles
-- ================================================================

-- First, let's create the student profiles with generated UUIDs
-- We'll use deterministic UUIDs based on the user names for consistency

-- Insert student profiles for the mock auth users
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
    gen_random_uuid(),
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
    gen_random_uuid(),
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
    gen_random_uuid(),
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
    gen_random_uuid(),
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
  );

-- Show the generated UUIDs so you can update your mock data
SELECT 
  user_id,
  display_name,
  grade_level,
  parent_email
FROM student_profiles 
WHERE parent_email IN (
  'alex.davis@sandview.plainviewisd.edu',
  'sam.brown@sandview.plainviewisd.edu',
  'jordan.smith@oceanview.plainviewisd.edu',
  'taylor.johnson@cityview.plainviewisd.edu'
)
ORDER BY grade_level;