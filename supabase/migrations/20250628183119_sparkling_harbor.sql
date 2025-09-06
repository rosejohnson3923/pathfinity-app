/*
  # Multi-Tenant Foundation Schema

  1. New Tables
    - `tenants`
      - `id` (uuid, primary key)
      - `name` (text, tenant organization name)
      - `slug` (text, unique identifier for URLs)
      - `domain` (text, custom domain if applicable)
      - `settings` (jsonb, tenant-specific configuration)
      - `subscription_tier` (text, pricing tier)
      - `max_users` (integer, user limit)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `user_profiles`
      - `id` (uuid, references auth.users)
      - `tenant_id` (uuid, references tenants)
      - `email` (text)
      - `full_name` (text)
      - `avatar_url` (text)
      - `role` (text, student/educator/admin/product_admin)
      - `grade_level` (text, for students)
      - `subjects` (text array, for educators)
      - `preferences` (jsonb, user settings)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for tenant isolation
    - Add policies for role-based access
*/

-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  domain text,
  settings jsonb DEFAULT '{}',
  subscription_tier text DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'premium', 'enterprise')),
  max_users integer DEFAULT 100,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  role text DEFAULT 'student' CHECK (role IN ('student', 'educator', 'admin', 'product_admin')),
  grade_level text,
  subjects text[],
  preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Tenant policies
CREATE POLICY "Product admins can manage all tenants"
  ON tenants
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
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
      WHERE user_profiles.id = auth.uid()
    )
  );

-- User profile policies
CREATE POLICY "Users can view profiles in their tenant"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE user_profiles.id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can manage profiles in their tenant"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND role IN ('admin', 'product_admin')
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_user_profiles_tenant_id ON user_profiles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_tenants_updated_at 
  BEFORE UPDATE ON tenants 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();