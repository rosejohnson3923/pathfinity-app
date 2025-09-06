/*
  # Fix RLS Policy Performance Issues Across All Tables

  This migration optimizes all RLS policies by wrapping auth.uid() calls
  with SELECT statements to prevent re-evaluation for each row.
  
  Changes:
  - auth.uid() → (select auth.uid())
  - Maintains exact same security logic
  - Improves query performance at scale
*/

-- Fix projects policies
DROP POLICY IF EXISTS "Users can view projects in their tenant" ON projects;
DROP POLICY IF EXISTS "Users can create projects in their tenant" ON projects;
DROP POLICY IF EXISTS "Project creators and admins can update projects" ON projects;

CREATE POLICY "Users can view projects in their tenant"
  ON projects FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())));

CREATE POLICY "Users can create projects in their tenant"
  ON projects FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())) AND
    creator_id = (select auth.uid())
  );

CREATE POLICY "Project creators and admins can update projects"
  ON projects FOR UPDATE TO authenticated
  USING (
    creator_id = (select auth.uid()) OR
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('educator', 'admin', 'product_admin')
    )
  );

-- Fix project_members policies
DROP POLICY IF EXISTS "Project members can view membership" ON project_members;
DROP POLICY IF EXISTS "Project leaders can manage membership" ON project_members;

CREATE POLICY "Project members can view membership"
  ON project_members FOR SELECT TO authenticated
  USING (
    user_id = (select auth.uid()) OR
    project_id IN (SELECT project_id FROM project_members WHERE user_id = (select auth.uid())) OR
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('educator', 'admin', 'product_admin')
    )
  );

CREATE POLICY "Project leaders can manage membership"
  ON project_members FOR ALL TO authenticated
  USING (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = (select auth.uid()) AND role = 'leader'
    ) OR
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('educator', 'admin', 'product_admin')
    )
  );

-- Fix project_submissions policies
DROP POLICY IF EXISTS "Project members can view submissions" ON project_submissions;
DROP POLICY IF EXISTS "Project members can create submissions" ON project_submissions;

CREATE POLICY "Project members can view submissions"
  ON project_submissions FOR SELECT TO authenticated
  USING (
    submitter_id = (select auth.uid()) OR
    project_id IN (SELECT project_id FROM project_members WHERE user_id = (select auth.uid())) OR
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('educator', 'admin', 'product_admin')
    )
  );

CREATE POLICY "Project members can create submissions"
  ON project_submissions FOR INSERT TO authenticated
  WITH CHECK (
    submitter_id = (select auth.uid()) AND
    project_id IN (SELECT project_id FROM project_members WHERE user_id = (select auth.uid()))
  );

-- Fix collaboration_spaces policies
DROP POLICY IF EXISTS "Project members can access collaboration spaces" ON collaboration_spaces;

CREATE POLICY "Project members can access collaboration spaces"
  ON collaboration_spaces FOR ALL TO authenticated
  USING (
    project_id IN (SELECT project_id FROM project_members WHERE user_id = (select auth.uid())) OR
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('educator', 'admin', 'product_admin')
    )
  );

-- Fix peer_reviews policies
DROP POLICY IF EXISTS "Users can manage their own reviews" ON peer_reviews;

CREATE POLICY "Users can manage their own reviews"
  ON peer_reviews FOR ALL TO authenticated
  USING (
    reviewer_id = (select auth.uid()) OR
    reviewee_id = (select auth.uid()) OR
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('educator', 'admin', 'product_admin')
    )
  );

-- Fix mentorships policies
DROP POLICY IF EXISTS "Mentors and mentees can view their mentorships" ON mentorships;
DROP POLICY IF EXISTS "Mentors and mentees can update their mentorships" ON mentorships;

CREATE POLICY "Mentors and mentees can view their mentorships"
  ON mentorships FOR SELECT TO authenticated
  USING (
    mentor_id = (select auth.uid()) OR
    mentee_id = (select auth.uid()) OR
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('educator', 'admin', 'product_admin')
    )
  );

CREATE POLICY "Mentors and mentees can update their mentorships"
  ON mentorships FOR UPDATE TO authenticated
  USING (mentor_id = (select auth.uid()) OR mentee_id = (select auth.uid()))
  WITH CHECK (mentor_id = (select auth.uid()) OR mentee_id = (select auth.uid()));

-- Fix achievements policies
DROP POLICY IF EXISTS "Users can view achievements in their tenant" ON achievements;
DROP POLICY IF EXISTS "Admins can manage achievements in their tenant" ON achievements;

CREATE POLICY "Users can view achievements in their tenant"
  ON achievements FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())));

CREATE POLICY "Admins can manage achievements in their tenant"
  ON achievements FOR ALL TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('admin', 'product_admin')
    )
  );

-- Fix user_achievements policies
DROP POLICY IF EXISTS "Users can view achievements in their tenant" ON user_achievements;
DROP POLICY IF EXISTS "Users can view their own achievements" ON user_achievements;
DROP POLICY IF EXISTS "System can award achievements" ON user_achievements;

CREATE POLICY "Users can view achievements in their tenant"
  ON user_achievements FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())));

CREATE POLICY "Users can view their own achievements"
  ON user_achievements FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "System can award achievements"
  ON user_achievements FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())));

-- Fix points_transactions policies
DROP POLICY IF EXISTS "Users can view their own points transactions" ON points_transactions;
DROP POLICY IF EXISTS "Educators can view points in their tenant" ON points_transactions;
DROP POLICY IF EXISTS "System can create points transactions" ON points_transactions;

CREATE POLICY "Users can view their own points transactions"
  ON points_transactions FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Educators can view points in their tenant"
  ON points_transactions FOR SELECT TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('educator', 'admin', 'product_admin')
    )
  );

CREATE POLICY "System can create points transactions"
  ON points_transactions FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())));

-- Fix leaderboards policies
DROP POLICY IF EXISTS "Users can view leaderboards in their tenant" ON leaderboards;
DROP POLICY IF EXISTS "Admins can manage leaderboards in their tenant" ON leaderboards;

CREATE POLICY "Users can view leaderboards in their tenant"
  ON leaderboards FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())));

CREATE POLICY "Admins can manage leaderboards in their tenant"
  ON leaderboards FOR ALL TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('admin', 'product_admin')
    )
  );

-- Fix streaks policies
DROP POLICY IF EXISTS "Users can view their own streaks" ON streaks;
DROP POLICY IF EXISTS "System can manage streaks" ON streaks;

CREATE POLICY "Users can view their own streaks"
  ON streaks FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "System can manage streaks"
  ON streaks FOR ALL TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())));

-- Fix rewards policies
DROP POLICY IF EXISTS "Users can view rewards in their tenant" ON rewards;
DROP POLICY IF EXISTS "Admins can manage rewards in their tenant" ON rewards;

CREATE POLICY "Users can view rewards in their tenant"
  ON rewards FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())));

CREATE POLICY "Admins can manage rewards in their tenant"
  ON rewards FOR ALL TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('admin', 'product_admin')
    )
  );

-- Fix user_reward_redemptions policies
DROP POLICY IF EXISTS "Users can view their own redemptions" ON user_reward_redemptions;
DROP POLICY IF EXISTS "Users can redeem rewards" ON user_reward_redemptions;
DROP POLICY IF EXISTS "Admins can manage redemptions in their tenant" ON user_reward_redemptions;

CREATE POLICY "Users can view their own redemptions"
  ON user_reward_redemptions FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can redeem rewards"
  ON user_reward_redemptions FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Admins can manage redemptions in their tenant"
  ON user_reward_redemptions FOR ALL TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('admin', 'product_admin')
    )
  );

-- Fix content_library policies
DROP POLICY IF EXISTS "Users can view published content in their tenant" ON content_library;
DROP POLICY IF EXISTS "Users can create content in their tenant" ON content_library;
DROP POLICY IF EXISTS "Creators can update their own content" ON content_library;

CREATE POLICY "Users can view published content in their tenant"
  ON content_library FOR SELECT TO authenticated
  USING (
    tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())) AND
    (is_published = true OR creator_id = (select auth.uid()))
  );

CREATE POLICY "Users can create content in their tenant"
  ON content_library FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())) AND
    creator_id = (select auth.uid())
  );

CREATE POLICY "Creators can update their own content"
  ON content_library FOR UPDATE TO authenticated
  USING (creator_id = (select auth.uid()))
  WITH CHECK (creator_id = (select auth.uid()));

-- Fix media_files policies
DROP POLICY IF EXISTS "Users can view media files based on access level" ON media_files;
DROP POLICY IF EXISTS "Users can upload media files to their tenant" ON media_files;

CREATE POLICY "Users can view media files based on access level"
  ON media_files FOR SELECT TO authenticated
  USING (
    access_level = 'public' OR
    (access_level = 'tenant' AND tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid()))) OR
    (access_level = 'private' AND uploader_id = (select auth.uid()))
  );

CREATE POLICY "Users can upload media files to their tenant"
  ON media_files FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())) AND
    uploader_id = (select auth.uid())
  );

-- Fix live_sessions policies
DROP POLICY IF EXISTS "Users can view sessions in their tenant" ON live_sessions;
DROP POLICY IF EXISTS "Users can create sessions in their tenant" ON live_sessions;
DROP POLICY IF EXISTS "Hosts can update their sessions" ON live_sessions;

CREATE POLICY "Users can view sessions in their tenant"
  ON live_sessions FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())));

CREATE POLICY "Users can create sessions in their tenant"
  ON live_sessions FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())) AND
    host_id = (select auth.uid())
  );

CREATE POLICY "Hosts can update their sessions"
  ON live_sessions FOR UPDATE TO authenticated
  USING (host_id = (select auth.uid()))
  WITH CHECK (host_id = (select auth.uid()));

-- Fix session_participants policies
DROP POLICY IF EXISTS "Participants can view session participation" ON session_participants;

CREATE POLICY "Participants can view session participation"
  ON session_participants FOR SELECT TO authenticated
  USING (
    user_id = (select auth.uid()) OR
    session_id IN (SELECT id FROM live_sessions WHERE host_id = (select auth.uid())) OR
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('educator', 'admin', 'product_admin')
    )
  );

-- Fix recordings policies
DROP POLICY IF EXISTS "Users can view recordings based on access level" ON recordings;
DROP POLICY IF EXISTS "Users can create recordings in their tenant" ON recordings;

CREATE POLICY "Users can view recordings based on access level"
  ON recordings FOR SELECT TO authenticated
  USING (
    access_level = 'public' OR
    (access_level = 'tenant' AND tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid()))) OR
    creator_id = (select auth.uid())
  );

CREATE POLICY "Users can create recordings in their tenant"
  ON recordings FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())) AND
    creator_id = (select auth.uid())
  );

-- Fix creative_assets policies
DROP POLICY IF EXISTS "Users can view public assets and assets in their tenant" ON creative_assets;
DROP POLICY IF EXISTS "Users can create assets in their tenant" ON creative_assets;
DROP POLICY IF EXISTS "Creators can update their own assets" ON creative_assets;

CREATE POLICY "Users can view public assets and assets in their tenant"
  ON creative_assets FOR SELECT TO authenticated
  USING (
    is_public = true OR
    tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid()))
  );

CREATE POLICY "Users can create assets in their tenant"
  ON creative_assets FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())) AND
    creator_id = (select auth.uid())
  );

CREATE POLICY "Creators can update their own assets"
  ON creative_assets FOR UPDATE TO authenticated
  USING (creator_id = (select auth.uid()))
  WITH CHECK (creator_id = (select auth.uid()));