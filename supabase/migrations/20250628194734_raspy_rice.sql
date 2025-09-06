/*
  # Fix All Policy Conflicts Across Public Tables

  This migration eliminates all policy conflicts by:
  1. Dropping overlapping policies (FOR ALL + specific action policies)
  2. Creating granular, non-overlapping policies for each action
  3. Maintaining the same security logic while eliminating conflicts
*/

-- ============================================================================
-- TENANTS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Product admins can manage all tenants" ON tenants;
DROP POLICY IF EXISTS "Tenant admins can view their tenant" ON tenants;

-- Granular tenant policies
CREATE POLICY "All users can view their tenant"
  ON tenants FOR SELECT TO authenticated
  USING (
    id IN (SELECT tenant_id FROM user_profiles WHERE user_profiles.id = (select auth.uid())) OR
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = (select auth.uid()) AND user_profiles.role = 'product_admin')
  );

CREATE POLICY "Product admins can insert tenants"
  ON tenants FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = (select auth.uid()) AND user_profiles.role = 'product_admin')
  );

CREATE POLICY "Product admins can update tenants"
  ON tenants FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = (select auth.uid()) AND user_profiles.role = 'product_admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = (select auth.uid()) AND user_profiles.role = 'product_admin')
  );

CREATE POLICY "Product admins can delete tenants"
  ON tenants FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = (select auth.uid()) AND user_profiles.role = 'product_admin')
  );

-- ============================================================================
-- USER_PROFILES TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Users can view profiles in their tenant" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage profiles in their tenant" ON user_profiles;

-- Granular user_profiles policies
CREATE POLICY "Users can view profiles in their tenant"
  ON user_profiles FOR SELECT TO authenticated
  USING (
    tenant_id IN (SELECT tenant_id FROM user_profiles WHERE user_profiles.id = (select auth.uid()))
  );

CREATE POLICY "Admins can insert profiles in their tenant"
  ON user_profiles FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE user_profiles.id = (select auth.uid()) AND role IN ('admin', 'product_admin')
    )
  );

CREATE POLICY "Users can update their own profile and admins can update profiles in their tenant"
  ON user_profiles FOR UPDATE TO authenticated
  USING (
    id = (select auth.uid()) OR
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE user_profiles.id = (select auth.uid()) AND role IN ('admin', 'product_admin')
    )
  )
  WITH CHECK (
    id = (select auth.uid()) OR
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE user_profiles.id = (select auth.uid()) AND role IN ('admin', 'product_admin')
    )
  );

CREATE POLICY "Admins can delete profiles in their tenant"
  ON user_profiles FOR DELETE TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE user_profiles.id = (select auth.uid()) AND role IN ('admin', 'product_admin')
    )
  );

-- ============================================================================
-- SUBJECTS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Users can view subjects in their tenant" ON subjects;
DROP POLICY IF EXISTS "Educators and admins can manage subjects in their tenant" ON subjects;

CREATE POLICY "Users can view subjects in their tenant"
  ON subjects FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())));

CREATE POLICY "Educators and admins can insert subjects in their tenant"
  ON subjects FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('educator', 'admin', 'product_admin')
    )
  );

CREATE POLICY "Educators and admins can update subjects in their tenant"
  ON subjects FOR UPDATE TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('educator', 'admin', 'product_admin')
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('educator', 'admin', 'product_admin')
    )
  );

CREATE POLICY "Educators and admins can delete subjects in their tenant"
  ON subjects FOR DELETE TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('educator', 'admin', 'product_admin')
    )
  );

-- ============================================================================
-- MASTERY_GROUPS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Users can view mastery groups in their tenant" ON mastery_groups;
DROP POLICY IF EXISTS "Educators and admins can manage mastery groups in their tenant" ON mastery_groups;

CREATE POLICY "Users can view mastery groups in their tenant"
  ON mastery_groups FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())));

CREATE POLICY "Educators and admins can insert mastery groups in their tenant"
  ON mastery_groups FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('educator', 'admin', 'product_admin')
    )
  );

CREATE POLICY "Educators and admins can update mastery groups in their tenant"
  ON mastery_groups FOR UPDATE TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('educator', 'admin', 'product_admin')
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('educator', 'admin', 'product_admin')
    )
  );

CREATE POLICY "Educators and admins can delete mastery groups in their tenant"
  ON mastery_groups FOR DELETE TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('educator', 'admin', 'product_admin')
    )
  );

-- ============================================================================
-- SKILLS_TOPICS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Users can view skills topics in their tenant" ON skills_topics;
DROP POLICY IF EXISTS "Educators and admins can manage skills topics in their tenant" ON skills_topics;

CREATE POLICY "Users can view skills topics in their tenant"
  ON skills_topics FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())));

CREATE POLICY "Educators and admins can insert skills topics in their tenant"
  ON skills_topics FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('educator', 'admin', 'product_admin')
    )
  );

CREATE POLICY "Educators and admins can update skills topics in their tenant"
  ON skills_topics FOR UPDATE TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('educator', 'admin', 'product_admin')
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('educator', 'admin', 'product_admin')
    )
  );

CREATE POLICY "Educators and admins can delete skills topics in their tenant"
  ON skills_topics FOR DELETE TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('educator', 'admin', 'product_admin')
    )
  );

-- ============================================================================
-- LESSON_PLANS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Students can view their own lesson plans" ON lesson_plans;
DROP POLICY IF EXISTS "Students can update their own lesson progress" ON lesson_plans;
DROP POLICY IF EXISTS "Educators can view lesson plans for students in their tenant" ON lesson_plans;

CREATE POLICY "Users can view lesson plans in their tenant"
  ON lesson_plans FOR SELECT TO authenticated
  USING (
    (student_id = (select auth.uid()) AND tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid()))) OR
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('educator', 'admin', 'product_admin')
    )
  );

CREATE POLICY "System can insert lesson plans"
  ON lesson_plans FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())));

CREATE POLICY "Students can update their own lesson progress and system can update"
  ON lesson_plans FOR UPDATE TO authenticated
  USING (
    student_id = (select auth.uid()) OR
    tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid()))
  )
  WITH CHECK (
    student_id = (select auth.uid()) OR
    tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid()))
  );

CREATE POLICY "System can delete lesson plans"
  ON lesson_plans FOR DELETE TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())));

-- ============================================================================
-- STUDENT_PROGRESS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Students can view their own progress" ON student_progress;
DROP POLICY IF EXISTS "System can update student progress" ON student_progress;

CREATE POLICY "Students can view their own progress and educators can view all"
  ON student_progress FOR SELECT TO authenticated
  USING (
    (student_id = (select auth.uid()) AND tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid()))) OR
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('educator', 'admin', 'product_admin')
    )
  );

CREATE POLICY "System can insert student progress"
  ON student_progress FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())));

CREATE POLICY "System can update student progress"
  ON student_progress FOR UPDATE TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())))
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())));

CREATE POLICY "System can delete student progress"
  ON student_progress FOR DELETE TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())));

-- ============================================================================
-- ASSESSMENTS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Students can manage their own assessments" ON assessments;
DROP POLICY IF EXISTS "Educators can view assessments in their tenant" ON assessments;

CREATE POLICY "Students and educators can view assessments"
  ON assessments FOR SELECT TO authenticated
  USING (
    (student_id = (select auth.uid()) AND tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid()))) OR
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('educator', 'admin', 'product_admin')
    )
  );

CREATE POLICY "Students can insert their own assessments"
  ON assessments FOR INSERT TO authenticated
  WITH CHECK (
    student_id = (select auth.uid()) AND 
    tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid()))
  );

CREATE POLICY "Students can update their own assessments"
  ON assessments FOR UPDATE TO authenticated
  USING (
    student_id = (select auth.uid()) AND 
    tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid()))
  )
  WITH CHECK (
    student_id = (select auth.uid()) AND 
    tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid()))
  );

CREATE POLICY "Students can delete their own assessments"
  ON assessments FOR DELETE TO authenticated
  USING (
    student_id = (select auth.uid()) AND 
    tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid()))
  );

-- ============================================================================
-- LEARNING_PATHS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Students can view their own learning paths" ON learning_paths;
DROP POLICY IF EXISTS "System can manage learning paths" ON learning_paths;

CREATE POLICY "Students can view their own learning paths"
  ON learning_paths FOR SELECT TO authenticated
  USING (
    student_id = (select auth.uid()) AND 
    tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid()))
  );

CREATE POLICY "System can insert learning paths"
  ON learning_paths FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())));

CREATE POLICY "System can update learning paths"
  ON learning_paths FOR UPDATE TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())))
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())));

CREATE POLICY "System can delete learning paths"
  ON learning_paths FOR DELETE TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())));

-- ============================================================================
-- PROJECTS TABLE
-- ============================================================================
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
  )
  WITH CHECK (
    creator_id = (select auth.uid()) OR
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('educator', 'admin', 'product_admin')
    )
  );

CREATE POLICY "Project creators and admins can delete projects"
  ON projects FOR DELETE TO authenticated
  USING (
    creator_id = (select auth.uid()) OR
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('educator', 'admin', 'product_admin')
    )
  );

-- ============================================================================
-- PROJECT_MEMBERS TABLE
-- ============================================================================
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

CREATE POLICY "Project leaders can insert membership"
  ON project_members FOR INSERT TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = (select auth.uid()) AND role = 'leader'
    ) OR
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('educator', 'admin', 'product_admin')
    )
  );

CREATE POLICY "Project leaders can update membership"
  ON project_members FOR UPDATE TO authenticated
  USING (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = (select auth.uid()) AND role = 'leader'
    ) OR
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('educator', 'admin', 'product_admin')
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = (select auth.uid()) AND role = 'leader'
    ) OR
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('educator', 'admin', 'product_admin')
    )
  );

CREATE POLICY "Project leaders can delete membership"
  ON project_members FOR DELETE TO authenticated
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

-- ============================================================================
-- PROJECT_SUBMISSIONS TABLE
-- ============================================================================
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

CREATE POLICY "Submitters can update their own submissions"
  ON project_submissions FOR UPDATE TO authenticated
  USING (submitter_id = (select auth.uid()))
  WITH CHECK (submitter_id = (select auth.uid()));

CREATE POLICY "Submitters can delete their own submissions"
  ON project_submissions FOR DELETE TO authenticated
  USING (submitter_id = (select auth.uid()));

-- ============================================================================
-- COLLABORATION_SPACES TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Project members can access collaboration spaces" ON collaboration_spaces;

CREATE POLICY "Project members can view collaboration spaces"
  ON collaboration_spaces FOR SELECT TO authenticated
  USING (
    project_id IN (SELECT project_id FROM project_members WHERE user_id = (select auth.uid())) OR
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('educator', 'admin', 'product_admin')
    )
  );

CREATE POLICY "Project members can insert collaboration spaces"
  ON collaboration_spaces FOR INSERT TO authenticated
  WITH CHECK (
    project_id IN (SELECT project_id FROM project_members WHERE user_id = (select auth.uid())) OR
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('educator', 'admin', 'product_admin')
    )
  );

CREATE POLICY "Project members can update collaboration spaces"
  ON collaboration_spaces FOR UPDATE TO authenticated
  USING (
    project_id IN (SELECT project_id FROM project_members WHERE user_id = (select auth.uid())) OR
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('educator', 'admin', 'product_admin')
    )
  )
  WITH CHECK (
    project_id IN (SELECT project_id FROM project_members WHERE user_id = (select auth.uid())) OR
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('educator', 'admin', 'product_admin')
    )
  );

CREATE POLICY "Project members can delete collaboration spaces"
  ON collaboration_spaces FOR DELETE TO authenticated
  USING (
    project_id IN (SELECT project_id FROM project_members WHERE user_id = (select auth.uid())) OR
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('educator', 'admin', 'product_admin')
    )
  );

-- ============================================================================
-- PEER_REVIEWS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Users can manage their own reviews" ON peer_reviews;

CREATE POLICY "Users can view their own reviews"
  ON peer_reviews FOR SELECT TO authenticated
  USING (
    reviewer_id = (select auth.uid()) OR
    reviewee_id = (select auth.uid()) OR
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('educator', 'admin', 'product_admin')
    )
  );

CREATE POLICY "Users can insert their own reviews"
  ON peer_reviews FOR INSERT TO authenticated
  WITH CHECK (reviewer_id = (select auth.uid()));

CREATE POLICY "Users can update their own reviews"
  ON peer_reviews FOR UPDATE TO authenticated
  USING (reviewer_id = (select auth.uid()))
  WITH CHECK (reviewer_id = (select auth.uid()));

CREATE POLICY "Users can delete their own reviews"
  ON peer_reviews FOR DELETE TO authenticated
  USING (reviewer_id = (select auth.uid()));

-- ============================================================================
-- MENTORSHIPS TABLE
-- ============================================================================
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

CREATE POLICY "System can insert mentorships"
  ON mentorships FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())));

CREATE POLICY "Mentors and mentees can update their mentorships"
  ON mentorships FOR UPDATE TO authenticated
  USING (mentor_id = (select auth.uid()) OR mentee_id = (select auth.uid()))
  WITH CHECK (mentor_id = (select auth.uid()) OR mentee_id = (select auth.uid()));

CREATE POLICY "Admins can delete mentorships"
  ON mentorships FOR DELETE TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('admin', 'product_admin')
    )
  );

-- ============================================================================
-- USER_ACHIEVEMENTS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Users can view achievements in their tenant" ON user_achievements;
DROP POLICY IF EXISTS "Users can view their own achievements" ON user_achievements;
DROP POLICY IF EXISTS "System can award achievements" ON user_achievements;

CREATE POLICY "Users can view achievements in their tenant"
  ON user_achievements FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())));

CREATE POLICY "System can award achievements"
  ON user_achievements FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())));

CREATE POLICY "System can update achievements"
  ON user_achievements FOR UPDATE TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())))
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())));

CREATE POLICY "System can delete achievements"
  ON user_achievements FOR DELETE TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())));

-- ============================================================================
-- POINTS_TRANSACTIONS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Users can view their own points transactions" ON points_transactions;
DROP POLICY IF EXISTS "Educators can view points in their tenant" ON points_transactions;
DROP POLICY IF EXISTS "System can create points transactions" ON points_transactions;

CREATE POLICY "Users can view points transactions"
  ON points_transactions FOR SELECT TO authenticated
  USING (
    user_id = (select auth.uid()) OR
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('educator', 'admin', 'product_admin')
    )
  );

CREATE POLICY "System can create points transactions"
  ON points_transactions FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())));

-- ============================================================================
-- LEADERBOARDS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Users can view leaderboards in their tenant" ON leaderboards;
DROP POLICY IF EXISTS "Admins can manage leaderboards in their tenant" ON leaderboards;

CREATE POLICY "Users can view leaderboards in their tenant"
  ON leaderboards FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())));

CREATE POLICY "Admins can insert leaderboards in their tenant"
  ON leaderboards FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('admin', 'product_admin')
    )
  );

CREATE POLICY "Admins can update leaderboards in their tenant"
  ON leaderboards FOR UPDATE TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('admin', 'product_admin')
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('admin', 'product_admin')
    )
  );

CREATE POLICY "Admins can delete leaderboards in their tenant"
  ON leaderboards FOR DELETE TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('admin', 'product_admin')
    )
  );

-- ============================================================================
-- STREAKS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Users can view their own streaks" ON streaks;
DROP POLICY IF EXISTS "System can manage streaks" ON streaks;

CREATE POLICY "Users can view their own streaks"
  ON streaks FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "System can insert streaks"
  ON streaks FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())));

CREATE POLICY "System can update streaks"
  ON streaks FOR UPDATE TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())))
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())));

CREATE POLICY "System can delete streaks"
  ON streaks FOR DELETE TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())));

-- ============================================================================
-- REWARDS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Users can view rewards in their tenant" ON rewards;
DROP POLICY IF EXISTS "Admins can manage rewards in their tenant" ON rewards;

CREATE POLICY "Users can view rewards in their tenant"
  ON rewards FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())));

CREATE POLICY "Admins can insert rewards in their tenant"
  ON rewards FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('admin', 'product_admin')
    )
  );

CREATE POLICY "Admins can update rewards in their tenant"
  ON rewards FOR UPDATE TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('admin', 'product_admin')
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('admin', 'product_admin')
    )
  );

CREATE POLICY "Admins can delete rewards in their tenant"
  ON rewards FOR DELETE TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('admin', 'product_admin')
    )
  );

-- ============================================================================
-- USER_REWARD_REDEMPTIONS TABLE
-- ============================================================================
DROP POLICY IF EXISTS "Users can view their own redemptions" ON user_reward_redemptions;
DROP POLICY IF EXISTS "Users can redeem rewards" ON user_reward_redemptions;
DROP POLICY IF EXISTS "Admins can manage redemptions in their tenant" ON user_reward_redemptions;

CREATE POLICY "Users can view redemptions"
  ON user_reward_redemptions FOR SELECT TO authenticated
  USING (
    user_id = (select auth.uid()) OR
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('admin', 'product_admin')
    )
  );

CREATE POLICY "Users can redeem rewards"
  ON user_reward_redemptions FOR INSERT TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Admins can update redemptions in their tenant"
  ON user_reward_redemptions FOR UPDATE TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('admin', 'product_admin')
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('admin', 'product_admin')
    )
  );

CREATE POLICY "Admins can delete redemptions in their tenant"
  ON user_reward_redemptions FOR DELETE TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('admin', 'product_admin')
    )
  );

-- ============================================================================
-- CONTENT_LIBRARY TABLE
-- ============================================================================
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

CREATE POLICY "Creators can delete their own content"
  ON content_library FOR DELETE TO authenticated
  USING (creator_id = (select auth.uid()));

-- ============================================================================
-- MEDIA_FILES TABLE
-- ============================================================================
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

CREATE POLICY "Uploaders can update their own media files"
  ON media_files FOR UPDATE TO authenticated
  USING (uploader_id = (select auth.uid()))
  WITH CHECK (uploader_id = (select auth.uid()));

CREATE POLICY "Uploaders can delete their own media files"
  ON media_files FOR DELETE TO authenticated
  USING (uploader_id = (select auth.uid()));

-- ============================================================================
-- LIVE_SESSIONS TABLE
-- ============================================================================
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

CREATE POLICY "Hosts can delete their sessions"
  ON live_sessions FOR DELETE TO authenticated
  USING (host_id = (select auth.uid()));

-- ============================================================================
-- SESSION_PARTICIPANTS TABLE
-- ============================================================================
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

CREATE POLICY "System can insert session participation"
  ON session_participants FOR INSERT TO authenticated
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())));

CREATE POLICY "System can update session participation"
  ON session_participants FOR UPDATE TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())))
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())));

CREATE POLICY "System can delete session participation"
  ON session_participants FOR DELETE TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())));

-- ============================================================================
-- RECORDINGS TABLE
-- ============================================================================
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

CREATE POLICY "Creators can update their own recordings"
  ON recordings FOR UPDATE TO authenticated
  USING (creator_id = (select auth.uid()))
  WITH CHECK (creator_id = (select auth.uid()));

CREATE POLICY "Creators can delete their own recordings"
  ON recordings FOR DELETE TO authenticated
  USING (creator_id = (select auth.uid()));

-- ============================================================================
-- CREATIVE_ASSETS TABLE
-- ============================================================================
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

CREATE POLICY "Creators can delete their own assets"
  ON creative_assets FOR DELETE TO authenticated
  USING (creator_id = (select auth.uid()));