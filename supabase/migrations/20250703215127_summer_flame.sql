/*
  # Subject Data Migration
  
  This migration adds sample subject data and related information without requiring
  user references. It focuses on creating the curriculum structure that can later
  be associated with users.
  
  1. New Data
    - Sample subjects with detailed information
    - Mastery groups for core subjects
    - Skills topics organized by mastery group
  
  2. Implementation Notes
    - Uses ON CONFLICT clauses for idempotent execution
    - Avoids user-dependent data to prevent foreign key constraint errors
*/

-- Insert sample subjects with more detailed information
INSERT INTO subjects (id, tenant_id, name, code, grade_levels, description, color, icon) VALUES
('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440000', 'Mathematics', 'MATH', ARRAY['9','10','11','12'], 'Comprehensive mathematics curriculum covering algebra, geometry, statistics, and calculus', '#3B82F6', 'calculator'),
('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440000', 'English Language Arts', 'ELA', ARRAY['9','10','11','12'], 'Language arts curriculum focusing on reading comprehension, writing, and communication skills', '#8B5CF6', 'book-open'),
('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440000', 'Science', 'SCI', ARRAY['9','10','11','12'], 'Comprehensive science curriculum covering biology, chemistry, physics, and environmental science', '#10B981', 'microscope'),
('550e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440000', 'Social Studies', 'SS', ARRAY['9','10','11','12'], 'Social studies curriculum covering history, geography, economics, and civics', '#F59E0B', 'globe'),
('550e8400-e29b-41d4-a716-446655440034', '550e8400-e29b-41d4-a716-446655440000', 'Life Skills', 'LIFE', ARRAY['9','10','11','12'], 'Practical life skills curriculum covering financial literacy, career planning, and personal development', '#6366F1', 'target'),
('550e8400-e29b-41d4-a716-446655440035', '550e8400-e29b-41d4-a716-446655440000', 'Art & Design', 'ART', ARRAY['9','10','11','12'], 'Creative arts curriculum covering visual arts, design principles, and digital media', '#EC4899', 'palette')
ON CONFLICT (id) DO UPDATE SET 
  description = EXCLUDED.description,
  color = EXCLUDED.color,
  icon = EXCLUDED.icon;

-- Insert sample mastery groups for Mathematics
INSERT INTO mastery_groups (id, tenant_id, subject_id, name, description, grade_level, sequence_order) VALUES
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440030', 'Algebra Foundations', 'Core algebraic concepts and fundamental skills', '9', 1),
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440030', 'Geometry Essentials', 'Essential geometric principles and spatial reasoning', '9', 2),
('550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440030', 'Advanced Algebra', 'Complex algebraic concepts and applications', '10', 3),
('550e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440030', 'Statistics & Probability', 'Data analysis, statistical methods, and probability theory', '10', 4)
ON CONFLICT (id) DO NOTHING;

-- Insert sample mastery groups for English Language Arts
INSERT INTO mastery_groups (id, tenant_id, subject_id, name, description, grade_level, sequence_order) VALUES
('550e8400-e29b-41d4-a716-446655440105', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440031', 'Reading Comprehension', 'Strategies for understanding and analyzing various text types', '9', 1),
('550e8400-e29b-41d4-a716-446655440106', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440031', 'Writing Fundamentals', 'Core writing skills and composition techniques', '9', 2),
('550e8400-e29b-41d4-a716-446655440107', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440031', 'Literary Analysis', 'Critical analysis of literature and literary devices', '10', 3),
('550e8400-e29b-41d4-a716-446655440108', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440031', 'Research & Communication', 'Research methods and effective communication skills', '10', 4)
ON CONFLICT (id) DO NOTHING;

-- Insert sample skills topics for Mathematics - Algebra Foundations
INSERT INTO skills_topics (id, tenant_id, mastery_group_id, name, description, learning_objectives, difficulty_level, estimated_duration_minutes, sequence_order) VALUES
('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440101', 'Linear Equations', 'Solving and graphing linear equations', ARRAY['Solve one-step linear equations', 'Solve multi-step linear equations', 'Graph linear equations', 'Interpret linear equations in real-world contexts'], 2, 45, 1),
('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440101', 'Algebraic Expressions', 'Simplifying and evaluating algebraic expressions', ARRAY['Identify terms and coefficients', 'Combine like terms', 'Evaluate expressions with variables', 'Apply the distributive property'], 2, 40, 2),
('550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440101', 'Systems of Equations', 'Solving systems of linear equations', ARRAY['Solve systems by graphing', 'Solve systems by substitution', 'Solve systems by elimination', 'Apply systems to real-world problems'], 3, 50, 3)
ON CONFLICT (id) DO NOTHING;

-- Insert sample skills topics for Mathematics - Geometry Essentials
INSERT INTO skills_topics (id, tenant_id, mastery_group_id, name, description, learning_objectives, difficulty_level, estimated_duration_minutes, sequence_order) VALUES
('550e8400-e29b-41d4-a716-446655440204', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440102', 'Angles & Triangles', 'Properties of angles and triangles', ARRAY['Identify angle relationships', 'Apply angle sum theorems', 'Classify triangles', 'Apply triangle congruence criteria'], 2, 45, 1),
('550e8400-e29b-41d4-a716-446655440205', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440102', 'Coordinate Geometry', 'Working with shapes in the coordinate plane', ARRAY['Plot points in the coordinate plane', 'Find distances between points', 'Determine midpoints', 'Apply the distance formula'], 3, 50, 2),
('550e8400-e29b-41d4-a716-446655440206', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440102', 'Area & Volume', 'Calculating area and volume of various shapes', ARRAY['Calculate areas of polygons', 'Calculate areas of circles', 'Calculate volumes of prisms', 'Calculate volumes of cylinders'], 3, 55, 3)
ON CONFLICT (id) DO NOTHING;

-- Insert sample skills topics for English Language Arts - Reading Comprehension
INSERT INTO skills_topics (id, tenant_id, mastery_group_id, name, description, learning_objectives, difficulty_level, estimated_duration_minutes, sequence_order) VALUES
('550e8400-e29b-41d4-a716-446655440207', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440105', 'Main Idea & Details', 'Identifying main ideas and supporting details', ARRAY['Identify explicit main ideas', 'Infer implicit main ideas', 'Distinguish between main ideas and supporting details', 'Summarize texts effectively'], 2, 40, 1),
('550e8400-e29b-41d4-a716-446655440208', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440105', 'Author''s Purpose', 'Determining author''s purpose and perspective', ARRAY['Identify author''s explicit purpose', 'Infer author''s implicit purpose', 'Analyze author''s perspective', 'Evaluate author''s bias'], 3, 45, 2),
('550e8400-e29b-41d4-a716-446655440209', '550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440105', 'Text Structures', 'Analyzing different text structures', ARRAY['Identify chronological structures', 'Identify compare/contrast structures', 'Identify cause/effect structures', 'Identify problem/solution structures'], 3, 50, 3)
ON CONFLICT (id) DO NOTHING;

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