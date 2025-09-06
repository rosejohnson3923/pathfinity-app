/*
  # Fix RLS Policy Performance Issue

  1. Performance Fix
    - Update RLS policies to use (select auth.uid()) instead of auth.uid()
    - This prevents re-evaluation of auth functions for each row
    - Improves query performance at scale

  2. Tables Updated
    - tenants: Product admins policy
    - user_profiles: All policies using auth.uid()
    - Other tables with similar patterns
*/

-- Drop and recreate the problematic tenant policies
DROP POLICY IF EXISTS "Product admins can manage all tenants" ON tenants;
DROP POLICY IF EXISTS "Tenant admins can view their tenant" ON tenants;

-- Recreate tenant policies with performance optimization
CREATE POLICY "Product admins can manage all tenants"
  ON tenants
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = (select auth.uid()) 
      AND user_profiles.role = 'product_admin'
    )
  );

CREATE POLICY "Tenant admins can view their tenant"
  ON tenants
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE user_profiles.id = (select auth.uid())
    )
  );

-- Fix user_profiles policies
DROP POLICY IF EXISTS "Users can view profiles in their tenant" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage profiles in their tenant" ON user_profiles;

CREATE POLICY "Users can view profiles in their tenant"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE user_profiles.id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

CREATE POLICY "Admins can manage profiles in their tenant"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE user_profiles.id = (select auth.uid()) 
      AND role IN ('admin', 'product_admin')
    )
  );

-- Fix subjects policies
DROP POLICY IF EXISTS "Users can view subjects in their tenant" ON subjects;
DROP POLICY IF EXISTS "Educators and admins can manage subjects in their tenant" ON subjects;

CREATE POLICY "Users can view subjects in their tenant"
  ON subjects FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())));

CREATE POLICY "Educators and admins can manage subjects in their tenant"
  ON subjects FOR ALL TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('educator', 'admin', 'product_admin')
    )
  );

-- Fix mastery_groups policies
DROP POLICY IF EXISTS "Users can view mastery groups in their tenant" ON mastery_groups;
DROP POLICY IF EXISTS "Educators and admins can manage mastery groups in their tenant" ON mastery_groups;

CREATE POLICY "Users can view mastery groups in their tenant"
  ON mastery_groups FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())));

CREATE POLICY "Educators and admins can manage mastery groups in their tenant"
  ON mastery_groups FOR ALL TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('educator', 'admin', 'product_admin')
    )
  );

-- Fix skills_topics policies
DROP POLICY IF EXISTS "Users can view skills topics in their tenant" ON skills_topics;
DROP POLICY IF EXISTS "Educators and admins can manage skills topics in their tenant" ON skills_topics;

CREATE POLICY "Users can view skills topics in their tenant"
  ON skills_topics FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())));

CREATE POLICY "Educators and admins can manage skills topics in their tenant"
  ON skills_topics FOR ALL TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('educator', 'admin', 'product_admin')
    )
  );

-- Fix lesson_plans policies
DROP POLICY IF EXISTS "Students can view their own lesson plans" ON lesson_plans;
DROP POLICY IF EXISTS "Students can update their own lesson progress" ON lesson_plans;
DROP POLICY IF EXISTS "Educators can view lesson plans for students in their tenant" ON lesson_plans;

CREATE POLICY "Students can view their own lesson plans"
  ON lesson_plans FOR SELECT TO authenticated
  USING (
    student_id = (select auth.uid()) AND 
    tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid()))
  );

CREATE POLICY "Students can update their own lesson progress"
  ON lesson_plans FOR UPDATE TO authenticated
  USING (student_id = (select auth.uid()))
  WITH CHECK (student_id = (select auth.uid()));

CREATE POLICY "Educators can view lesson plans for students in their tenant"
  ON lesson_plans FOR SELECT TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('educator', 'admin', 'product_admin')
    )
  );

-- Fix student_progress policies
DROP POLICY IF EXISTS "Students can view their own progress" ON student_progress;
DROP POLICY IF EXISTS "System can update student progress" ON student_progress;

CREATE POLICY "Students can view their own progress"
  ON student_progress FOR SELECT TO authenticated
  USING (
    student_id = (select auth.uid()) AND 
    tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid()))
  );

CREATE POLICY "System can update student progress"
  ON student_progress FOR ALL TO authenticated
  USING (
    tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid()))
  );

-- Fix assessments policies
DROP POLICY IF EXISTS "Students can manage their own assessments" ON assessments;
DROP POLICY IF EXISTS "Educators can view assessments in their tenant" ON assessments;

CREATE POLICY "Students can manage their own assessments"
  ON assessments FOR ALL TO authenticated
  USING (
    student_id = (select auth.uid()) AND 
    tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid()))
  );

CREATE POLICY "Educators can view assessments in their tenant"
  ON assessments FOR SELECT TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('educator', 'admin', 'product_admin')
    )
  );

-- Fix learning_paths policies
DROP POLICY IF EXISTS "Students can view their own learning paths" ON learning_paths;
DROP POLICY IF EXISTS "System can manage learning paths" ON learning_paths;

CREATE POLICY "Students can view their own learning paths"
  ON learning_paths FOR SELECT TO authenticated
  USING (
    student_id = (select auth.uid()) AND 
    tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid()))
  );

CREATE POLICY "System can manage learning paths"
  ON learning_paths FOR ALL TO authenticated
  USING (
    tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid()))
  );