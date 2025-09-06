-- Create a function to generate sample data for the SubjectDetailPage
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
  
  -- Return the combined data
  RETURN jsonb_build_object(
    'subject', v_subject,
    'mastery_groups', COALESCE(v_mastery_groups, '[]'::jsonb),
    'skills_topics', COALESCE(v_skills_topics, '[]'::jsonb)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_subject_details TO authenticated;