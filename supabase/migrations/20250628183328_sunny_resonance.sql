/*
  # Content and Media Management

  1. New Tables
    - `content_library`
      - Educational content and resources
    - `media_files`
      - File storage metadata
    - `live_sessions`
      - STREAM live streaming sessions
    - `recordings`
      - Recorded content and sessions
    - `creative_assets`
      - BRAND studio created content

  2. Security
    - Enable RLS on all tables
    - Add tenant isolation policies
    - Add content access policies
*/

-- Create content library table
CREATE TABLE IF NOT EXISTS content_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  creator_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  content_type text NOT NULL CHECK (content_type IN ('lesson', 'video', 'document', 'interactive', 'assessment', 'template')),
  subject_areas text[],
  grade_levels text[],
  difficulty_level integer DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  content_data jsonb NOT NULL, -- actual content or references
  metadata jsonb DEFAULT '{}', -- tags, keywords, etc.
  file_urls text[], -- associated media files
  thumbnail_url text,
  duration_minutes integer,
  language text DEFAULT 'en',
  accessibility_features text[], -- captions, audio_description, etc.
  usage_rights text DEFAULT 'internal' CHECK (usage_rights IN ('internal', 'public', 'licensed')),
  view_count integer DEFAULT 0,
  rating_average decimal(3,2) DEFAULT 0.0,
  rating_count integer DEFAULT 0,
  is_published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create media files table
CREATE TABLE IF NOT EXISTS media_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  uploader_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  filename text NOT NULL,
  original_filename text NOT NULL,
  file_type text NOT NULL, -- mime type
  file_size_bytes bigint NOT NULL,
  storage_path text NOT NULL, -- Supabase storage path
  public_url text,
  thumbnail_url text,
  metadata jsonb DEFAULT '{}', -- dimensions, duration, etc.
  processing_status text DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  virus_scan_status text DEFAULT 'pending' CHECK (virus_scan_status IN ('pending', 'clean', 'infected')),
  access_level text DEFAULT 'private' CHECK (access_level IN ('private', 'tenant', 'public')),
  download_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create live sessions table
CREATE TABLE IF NOT EXISTS live_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  host_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  session_type text DEFAULT 'class' CHECK (session_type IN ('class', 'meeting', 'presentation', 'workshop', 'office_hours')),
  subject_area text,
  grade_level text,
  max_participants integer DEFAULT 50,
  scheduled_start timestamptz NOT NULL,
  scheduled_end timestamptz NOT NULL,
  actual_start timestamptz,
  actual_end timestamptz,
  meeting_url text, -- external meeting platform URL
  meeting_id text, -- platform-specific meeting ID
  passcode text,
  settings jsonb DEFAULT '{}', -- recording, chat, etc.
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended', 'cancelled')),
  recording_url text,
  attendance_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create session participants table
CREATE TABLE IF NOT EXISTS session_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  session_id uuid REFERENCES live_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'participant' CHECK (role IN ('host', 'co_host', 'participant', 'observer')),
  joined_at timestamptz,
  left_at timestamptz,
  duration_minutes integer DEFAULT 0,
  participation_score integer DEFAULT 0 CHECK (participation_score BETWEEN 0 AND 100),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(session_id, user_id)
);

-- Create recordings table
CREATE TABLE IF NOT EXISTS recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  session_id uuid REFERENCES live_sessions(id) ON DELETE CASCADE,
  creator_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  recording_type text NOT NULL CHECK (recording_type IN ('live_session', 'lesson', 'presentation', 'student_work')),
  file_url text NOT NULL,
  thumbnail_url text,
  duration_minutes integer,
  file_size_bytes bigint,
  transcript_url text,
  captions_url text,
  chapters jsonb DEFAULT '[]', -- video chapters/segments
  view_count integer DEFAULT 0,
  access_level text DEFAULT 'private' CHECK (access_level IN ('private', 'class', 'tenant', 'public')),
  processing_status text DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create creative assets table
CREATE TABLE IF NOT EXISTS creative_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
  creator_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  asset_type text NOT NULL CHECK (asset_type IN ('presentation', 'poster', 'infographic', 'logo', 'document', 'template')),
  design_data jsonb NOT NULL, -- design tool specific data
  preview_url text,
  export_urls jsonb DEFAULT '{}', -- different format exports
  template_category text,
  is_template boolean DEFAULT false,
  is_public boolean DEFAULT false,
  view_count integer DEFAULT 0,
  like_count integer DEFAULT 0,
  fork_count integer DEFAULT 0, -- times used as template
  version integer DEFAULT 1,
  parent_asset_id uuid REFERENCES creative_assets(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE content_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE creative_assets ENABLE ROW LEVEL SECURITY;

-- Content library policies
CREATE POLICY "Users can view published content in their tenant"
  ON content_library FOR SELECT TO authenticated
  USING (
    tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = auth.uid()) AND
    (is_published = true OR creator_id = auth.uid())
  );

CREATE POLICY "Users can create content in their tenant"
  ON content_library FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = auth.uid()) AND
    creator_id = auth.uid()
  );

CREATE POLICY "Creators can update their own content"
  ON content_library FOR UPDATE TO authenticated
  USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());

-- Media files policies
CREATE POLICY "Users can view media files based on access level"
  ON media_files FOR SELECT TO authenticated
  USING (
    access_level = 'public' OR
    (access_level = 'tenant' AND tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())) OR
    (access_level = 'private' AND uploader_id = auth.uid())
  );

CREATE POLICY "Users can upload media files to their tenant"
  ON media_files FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = auth.uid()) AND
    uploader_id = auth.uid()
  );

-- Live sessions policies
CREATE POLICY "Users can view sessions in their tenant"
  ON live_sessions FOR SELECT TO authenticated
  USING (tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = auth.uid()));

CREATE POLICY "Users can create sessions in their tenant"
  ON live_sessions FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = auth.uid()) AND
    host_id = auth.uid()
  );

CREATE POLICY "Hosts can update their sessions"
  ON live_sessions FOR UPDATE TO authenticated
  USING (host_id = auth.uid())
  WITH CHECK (host_id = auth.uid());

-- Session participants policies
CREATE POLICY "Participants can view session participation"
  ON session_participants FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    session_id IN (SELECT id FROM live_sessions WHERE host_id = auth.uid()) OR
    tenant_id IN (
      SELECT tenant_id FROM user_profiles 
      WHERE id = auth.uid() AND role IN ('educator', 'admin', 'product_admin')
    )
  );

-- Recordings policies
CREATE POLICY "Users can view recordings based on access level"
  ON recordings FOR SELECT TO authenticated
  USING (
    access_level = 'public' OR
    (access_level = 'tenant' AND tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())) OR
    creator_id = auth.uid()
  );

CREATE POLICY "Users can create recordings in their tenant"
  ON recordings FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = auth.uid()) AND
    creator_id = auth.uid()
  );

-- Creative assets policies
CREATE POLICY "Users can view public assets and assets in their tenant"
  ON creative_assets FOR SELECT TO authenticated
  USING (
    is_public = true OR
    tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can create assets in their tenant"
  ON creative_assets FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM user_profiles WHERE id = auth.uid()) AND
    creator_id = auth.uid()
  );

CREATE POLICY "Creators can update their own assets"
  ON creative_assets FOR UPDATE TO authenticated
  USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_library_tenant_id ON content_library(tenant_id);
CREATE INDEX IF NOT EXISTS idx_content_library_subject_areas ON content_library USING GIN(subject_areas);
CREATE INDEX IF NOT EXISTS idx_content_library_grade_levels ON content_library USING GIN(grade_levels);
CREATE INDEX IF NOT EXISTS idx_media_files_tenant_id ON media_files(tenant_id);
CREATE INDEX IF NOT EXISTS idx_media_files_uploader_id ON media_files(uploader_id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_tenant_id ON live_sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_host_id ON live_sessions(host_id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_scheduled_start ON live_sessions(scheduled_start);
CREATE INDEX IF NOT EXISTS idx_session_participants_session_id ON session_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_recordings_tenant_id ON recordings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_creative_assets_tenant_id ON creative_assets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_creative_assets_creator_id ON creative_assets(creator_id);

-- Add updated_at triggers
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