-- Insert sample achievements for subjects
INSERT INTO achievements (id, tenant_id, title, description, icon, category, rarity, points_value, criteria, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440701', '550e8400-e29b-41d4-a716-446655440000', 'Math Whiz', 'Complete all Algebra Foundations skills', 'calculator', 'academic', 'rare', 300, '{"type": "subject_mastery", "subject_id": "550e8400-e29b-41d4-a716-446655440030", "mastery_group_id": "550e8400-e29b-41d4-a716-446655440101"}', true),
('550e8400-e29b-41d4-a716-446655440702', '550e8400-e29b-41d4-a716-446655440000', 'Geometry Genius', 'Master all Geometry Essentials skills', 'target', 'academic', 'rare', 300, '{"type": "subject_mastery", "subject_id": "550e8400-e29b-41d4-a716-446655440030", "mastery_group_id": "550e8400-e29b-41d4-a716-446655440102"}', true),
('550e8400-e29b-41d4-a716-446655440703', '550e8400-e29b-41d4-a716-446655440000', 'Reading Pro', 'Complete all Reading Comprehension skills', 'book-open', 'academic', 'rare', 300, '{"type": "subject_mastery", "subject_id": "550e8400-e29b-41d4-a716-446655440031", "mastery_group_id": "550e8400-e29b-41d4-a716-446655440105"}', true),
('550e8400-e29b-41d4-a716-446655440704', '550e8400-e29b-41d4-a716-446655440000', 'Writing Expert', 'Master all Writing Fundamentals skills', 'edit', 'academic', 'rare', 300, '{"type": "subject_mastery", "subject_id": "550e8400-e29b-41d4-a716-446655440031", "mastery_group_id": "550e8400-e29b-41d4-a716-446655440106"}', true)
ON CONFLICT (id) DO NOTHING;

-- Create a function to get subject progress data
CREATE OR REPLACE FUNCTION get_subject_progress(p_subject_id UUID, p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_progress JSONB;
BEGIN
  -- Get subject progress data
  SELECT jsonb_build_object(
    'mastery_level', sp.mastery_level,
    'progress_percentage', sp.progress_percentage,
    'streak_days', sp.streak_days,
    'last_activity_date', sp.last_activity_date,
    'total_time_spent_minutes', sp.total_time_spent_minutes,
    'lessons_completed', sp.lessons_completed,
    'assessments_passed', sp.assessments_passed
  ) INTO v_progress
  FROM student_progress sp
  WHERE sp.student_id = p_user_id
    AND sp.subject_id = p_subject_id
    AND sp.mastery_group_id IS NULL
    AND sp.skills_topic_id IS NULL;
  
  -- Return the progress data or a default object if not found
  RETURN COALESCE(v_progress, jsonb_build_object(
    'mastery_level', 'does-not-meet',
    'progress_percentage', 0,
    'streak_days', 0,
    'last_activity_date', NULL,
    'total_time_spent_minutes', 0,
    'lessons_completed', 0,
    'assessments_passed', 0
  ));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_subject_progress TO authenticated;

-- Update the get_subject_details function to include progress data
CREATE OR REPLACE FUNCTION get_subject_details(p_subject_id UUID, p_user_id UUID DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
  v_subject JSONB;
  v_mastery_groups JSONB;
  v_skills_topics JSONB;
  v_progress JSONB;
BEGIN
  -- Get subject details
  SELECT jsonb_build_object(
    'id', id,
    'name', name,
    'code', code,
    'description', description,
    'color', color,
    'icon', icon,
    'grade_levels', grade_levels
  ) INTO v_subject
  FROM subjects
  WHERE id = p_subject_id;
  
  -- Get mastery groups for this subject
  SELECT jsonb_agg(jsonb_build_object(
    'id', mg.id,
    'name', mg.name,
    'description', mg.description,
    'grade_level', mg.grade_level,
    'sequence_order', mg.sequence_order
  )) INTO v_mastery_groups
  FROM mastery_groups mg
  WHERE mg.subject_id = p_subject_id
  ORDER BY mg.sequence_order;
  
  -- Get skills topics for this subject
  SELECT jsonb_agg(jsonb_build_object(
    'id', st.id,
    'name', st.name,
    'description', st.description,
    'mastery_group_id', st.mastery_group_id,
    'difficulty_level', st.difficulty_level,
    'estimated_duration_minutes', st.estimated_duration_minutes,
    'sequence_order', st.sequence_order,
    'learning_objectives', st.learning_objectives
  )) INTO v_skills_topics
  FROM skills_topics st
  JOIN mastery_groups mg ON st.mastery_group_id = mg.id
  WHERE mg.subject_id = p_subject_id
  ORDER BY mg.sequence_order, st.sequence_order;
  
  -- Get progress data if user ID is provided
  IF p_user_id IS NOT NULL THEN
    v_progress := get_subject_progress(p_subject_id, p_user_id);
  END IF;
  
  -- Return the combined data
  RETURN jsonb_build_object(
    'subject', v_subject,
    'mastery_groups', COALESCE(v_mastery_groups, '[]'::jsonb),
    'skills_topics', COALESCE(v_skills_topics, '[]'::jsonb),
    'progress', COALESCE(v_progress, '{}'::jsonb)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;