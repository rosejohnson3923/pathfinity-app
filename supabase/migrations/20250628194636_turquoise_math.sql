/*
  # Fix Achievements Table Policy Conflict

  1. Issue
    - Multiple permissive policies for SELECT action on achievements table
    - "Admins can manage achievements in their tenant" (FOR ALL)
    - "Users can view achievements in their tenant" (FOR SELECT)
    - Both apply to authenticated users for SELECT operations

  2. Solution
    - Drop conflicting policies
    - Create separate policies for different actions
    - Ensure no overlap between policy scopes
*/

-- Drop the conflicting policies
DROP POLICY IF EXISTS "Users can view achievements in their tenant" ON achievements;
DROP POLICY IF EXISTS "Admins can manage achievements in their tenant" ON achievements;

-- Create non-overlapping policies

-- Policy 1: All users can view achievements in their tenant
CREATE POLICY "Users can view achievements in their tenant"
  ON achievements 
  FOR SELECT 
  TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = (select auth.uid())));

-- Policy 2: Only admins can insert achievements
CREATE POLICY "Admins can create achievements in their tenant"
  ON achievements 
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('admin', 'product_admin')
    )
  );

-- Policy 3: Only admins can update achievements
CREATE POLICY "Admins can update achievements in their tenant"
  ON achievements 
  FOR UPDATE 
  TO authenticated
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

-- Policy 4: Only admins can delete achievements
CREATE POLICY "Admins can delete achievements in their tenant"
  ON achievements 
  FOR DELETE 
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = (select auth.uid()) AND role IN ('admin', 'product_admin')
    )
  );