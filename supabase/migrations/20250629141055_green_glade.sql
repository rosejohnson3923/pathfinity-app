/*
  # Fix update_updated_at_column search_path security issue

  1. Problem
    - Function has mutable search_path which is a security vulnerability
    - Cannot drop function directly due to trigger dependencies

  2. Solution
    - Drop all dependent triggers first
    - Drop and recreate function with secure search_path
    - Recreate all triggers
*/

-- Drop all triggers that depend on the function
DROP TRIGGER IF EXISTS update_tenants_updated_at ON tenants;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_subjects_updated_at ON subjects;
DROP TRIGGER IF EXISTS update_mastery_groups_updated_at ON mastery_groups;
DROP TRIGGER IF EXISTS update_skills_topics_updated_at ON skills_topics;
DROP TRIGGER IF EXISTS update_lesson_plans_updated_at ON lesson_plans;
DROP TRIGGER IF EXISTS update_student_progress_updated_at ON student_progress;
DROP TRIGGER IF EXISTS update_assessments_updated_at ON assessments;
DROP TRIGGER IF EXISTS update_learning_paths_updated_at ON learning_paths;
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
DROP TRIGGER IF EXISTS update_project_members_updated_at ON project_members;
DROP TRIGGER IF EXISTS update_project_submissions_updated_at ON project_submissions;
DROP TRIGGER IF EXISTS update_collaboration_spaces_updated_at ON collaboration_spaces;
DROP TRIGGER IF EXISTS update_peer_reviews_updated_at ON peer_reviews;
DROP TRIGGER IF EXISTS update_mentorships_updated_at ON mentorships;
DROP TRIGGER IF EXISTS update_achievements_updated_at ON achievements;
DROP TRIGGER IF EXISTS update_user_achievements_updated_at ON user_achievements;
DROP TRIGGER IF EXISTS update_leaderboards_updated_at ON leaderboards;
DROP TRIGGER IF EXISTS update_streaks_updated_at ON streaks;
DROP TRIGGER IF EXISTS update_rewards_updated_at ON rewards;
DROP TRIGGER IF EXISTS update_user_reward_redemptions_updated_at ON user_reward_redemptions;
DROP TRIGGER IF EXISTS update_content_library_updated_at ON content_library;
DROP TRIGGER IF EXISTS update_media_files_updated_at ON media_files;
DROP TRIGGER IF EXISTS update_live_sessions_updated_at ON live_sessions;
DROP TRIGGER IF EXISTS update_session_participants_updated_at ON session_participants;
DROP TRIGGER IF EXISTS update_recordings_updated_at ON recordings;
DROP TRIGGER IF EXISTS update_creative_assets_updated_at ON creative_assets;

-- Now drop the function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Recreate the function with a secure, fixed search_path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Recreate all the triggers
CREATE TRIGGER update_tenants_updated_at 
  BEFORE UPDATE ON tenants 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subjects_updated_at 
  BEFORE UPDATE ON subjects 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mastery_groups_updated_at 
  BEFORE UPDATE ON mastery_groups 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skills_topics_updated_at 
  BEFORE UPDATE ON skills_topics 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lesson_plans_updated_at 
  BEFORE UPDATE ON lesson_plans 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_progress_updated_at 
  BEFORE UPDATE ON student_progress 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessments_updated_at 
  BEFORE UPDATE ON assessments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_paths_updated_at 
  BEFORE UPDATE ON learning_paths 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON projects 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_members_updated_at 
  BEFORE UPDATE ON project_members 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_submissions_updated_at 
  BEFORE UPDATE ON project_submissions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collaboration_spaces_updated_at 
  BEFORE UPDATE ON collaboration_spaces 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_peer_reviews_updated_at 
  BEFORE UPDATE ON peer_reviews 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mentorships_updated_at 
  BEFORE UPDATE ON mentorships 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_achievements_updated_at 
  BEFORE UPDATE ON achievements 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_achievements_updated_at 
  BEFORE UPDATE ON user_achievements 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leaderboards_updated_at 
  BEFORE UPDATE ON leaderboards 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_streaks_updated_at 
  BEFORE UPDATE ON streaks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rewards_updated_at 
  BEFORE UPDATE ON rewards 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_reward_redemptions_updated_at 
  BEFORE UPDATE ON user_reward_redemptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_library_updated_at 
  BEFORE UPDATE ON content_library 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_files_updated_at 
  BEFORE UPDATE ON media_files 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_live_sessions_updated_at 
  BEFORE UPDATE ON live_sessions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_participants_updated_at 
  BEFORE UPDATE ON session_participants 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recordings_updated_at 
  BEFORE UPDATE ON recordings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creative_assets_updated_at 
  BEFORE UPDATE ON creative_assets 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();