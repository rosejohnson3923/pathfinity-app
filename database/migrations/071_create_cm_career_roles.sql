-- Migration 071: Create cm_career_roles table
-- This table stores the master list of available careers for Career Match
-- Each career has a name and image path that must match actual files in /public/assets/

-- ============================================================================
-- CREATE cm_career_roles TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS cm_career_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  career_name TEXT NOT NULL UNIQUE,
  career_image_path TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE cm_career_roles IS 'Master list of available career roles for Career Match game';
COMMENT ON COLUMN cm_career_roles.career_name IS 'Display name of the career (e.g., "3D Artist")';
COMMENT ON COLUMN cm_career_roles.career_image_path IS 'Path to career image in /public/assets/ (e.g., "/assets/Discovered Live/Role - Landscape/3D Artist.png")';
COMMENT ON COLUMN cm_career_roles.is_active IS 'Whether this career is currently available for new games';

-- Create index on career_name for faster lookups
CREATE INDEX idx_cm_career_roles_name ON cm_career_roles(career_name);
CREATE INDEX idx_cm_career_roles_active ON cm_career_roles(is_active) WHERE is_active = true;

-- ============================================================================
-- SEED cm_career_roles FROM ACTUAL IMAGE FILES
-- ============================================================================

-- Insert all 50 careers that have image files in /public/assets/Discovered Live/Role - Landscape/
INSERT INTO cm_career_roles (career_name, career_image_path) VALUES
  ('3D Artist', '/assets/Discovered Live/Role - Landscape/3D Artist.png'),
  ('Accountant', '/assets/Discovered Live/Role - Landscape/Accountant.png'),
  ('Auditor', '/assets/Discovered Live/Role - Landscape/Auditor.png'),
  ('Broadcast Engineer', '/assets/Discovered Live/Role - Landscape/Broadcast Engineer.png'),
  ('Business Developer', '/assets/Discovered Live/Role - Landscape/Business Developer.png'),
  ('Cloud Security Engineer', '/assets/Discovered Live/Role - Landscape/Cloud Security Engineer.png'),
  ('Community Manager', '/assets/Discovered Live/Role - Landscape/Community Manager.png'),
  ('Content Creator', '/assets/Discovered Live/Role - Landscape/Content Creator.png'),
  ('Customer Support', '/assets/Discovered Live/Role - Landscape/Customer Support.png'),
  ('CyberSecurity Analyst', '/assets/Discovered Live/Role - Landscape/CyberSecurity Analyst.png'),
  ('Equipment Manager', '/assets/Discovered Live/Role - Landscape/Equipment Manager.png'),
  ('Esports Agent', '/assets/Discovered Live/Role - Landscape/Esports Agent.png'),
  ('Esports Analyst', '/assets/Discovered Live/Role - Landscape/Esports Analyst.png'),
  ('Esports Asst Coach', '/assets/Discovered Live/Role - Landscape/Esports Asst Coach.png'),
  ('Esports Nutritionist', '/assets/Discovered Live/Role - Landscape/Esports Nutritionist.png'),
  ('Event Manager', '/assets/Discovered Live/Role - Landscape/Event Manager.png'),
  ('Facilities Manager', '/assets/Discovered Live/Role - Landscape/Facilities Manager.png'),
  ('Financial Analyst', '/assets/Discovered Live/Role - Landscape/Financial Analyst.png'),
  ('Fitness Coach', '/assets/Discovered Live/Role - Landscape/Fitness Coach.png'),
  ('Game Designer', '/assets/Discovered Live/Role - Landscape/Game Designer.png'),
  ('General Manager', '/assets/Discovered Live/Role - Landscape/General Manager.png'),
  ('Graphic Designer', '/assets/Discovered Live/Role - Landscape/Graphic Designer.png'),
  ('Head Chef', '/assets/Discovered Live/Role - Landscape/Head Chef.png'),
  ('Head Coach', '/assets/Discovered Live/Role - Landscape/Head Coach.png'),
  ('HR Manager', '/assets/Discovered Live/Role - Landscape/HR Manager.png'),
  ('Influencer', '/assets/Discovered Live/Role - Landscape/Influencer.png'),
  ('IT Coordinator', '/assets/Discovered Live/Role - Landscape/IT Coordinator.png'),
  ('Journalist', '/assets/Discovered Live/Role - Landscape/Journalist.png'),
  ('Lawyer', '/assets/Discovered Live/Role - Landscape/Lawyer.png'),
  ('Lighting Tech', '/assets/Discovered Live/Role - Landscape/Lighting Tech.png'),
  ('Performance Coach', '/assets/Discovered Live/Role - Landscape/Performance Coach.png'),
  ('Photographer', '/assets/Discovered Live/Role - Landscape/Photographer.png'),
  ('Production Manager', '/assets/Discovered Live/Role - Landscape/Production Manager.png'),
  ('Product Manager', '/assets/Discovered Live/Role - Landscape/Product Manager.png'),
  ('Program Manager', '/assets/Discovered Live/Role - Landscape/Program Manager.png'),
  ('Project Manager', '/assets/Discovered Live/Role - Landscape/Project Manager.png'),
  ('Psychologist', '/assets/Discovered Live/Role - Landscape/Psychologist.png'),
  ('Public Relations Specialist', '/assets/Discovered Live/Role - Landscape/Public Relations Specialist.png'),
  ('Scriptwriter', '/assets/Discovered Live/Role - Landscape/Scriptwriter.png'),
  ('Social Media Manager', '/assets/Discovered Live/Role - Landscape/Social Media Manager.png'),
  ('Software Engineer', '/assets/Discovered Live/Role - Landscape/Software Engineer.png'),
  ('Sound Engineer', '/assets/Discovered Live/Role - Landscape/Sound Engineer.png'),
  ('Sponsorship Coordinator', '/assets/Discovered Live/Role - Landscape/Sponsorship Coordinator.png'),
  ('Talent Scout', '/assets/Discovered Live/Role - Landscape/Talent Scout.png'),
  ('Team Captain', '/assets/Discovered Live/Role - Landscape/Team Captain.png'),
  ('Team Manager', '/assets/Discovered Live/Role - Landscape/Team Manager.png'),
  ('Tech Support', '/assets/Discovered Live/Role - Landscape/Tech Support.png'),
  ('Travel Coordinator', '/assets/Discovered Live/Role - Landscape/Travel Coordinator.png'),
  ('Treasurer', '/assets/Discovered Live/Role - Landscape/Treasurer.png'),
  ('Videographer', '/assets/Discovered Live/Role - Landscape/Videographer.png')
ON CONFLICT (career_name) DO NOTHING;

-- ============================================================================
-- ADD FOREIGN KEY TO cm_cards
-- ============================================================================

-- Add career_role_id column to cm_cards
ALTER TABLE cm_cards
ADD COLUMN IF NOT EXISTS career_role_id UUID REFERENCES cm_career_roles(id);

-- Create index for foreign key lookups
CREATE INDEX IF NOT EXISTS idx_cm_cards_career_role_id ON cm_cards(career_role_id);

COMMENT ON COLUMN cm_cards.career_role_id IS 'Foreign key to cm_career_roles - links card to career definition';

-- ============================================================================
-- UPDATE EXISTING CARDS TO LINK TO cm_career_roles
-- ============================================================================

-- Update existing cards to set career_role_id based on career_name
UPDATE cm_cards c
SET career_role_id = cr.id
FROM cm_career_roles cr
WHERE c.career_name = cr.career_name
  AND c.career_role_id IS NULL;

-- ============================================================================
-- UPDATE cm_initialize_cards FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION cm_initialize_cards(
  p_room_id UUID,
  p_difficulty VARCHAR(10)
)
RETURNS VOID AS $$
DECLARE
  v_grid_size INTEGER;
  v_selected_careers RECORD;
  v_shuffled_positions INTEGER[];
  v_pair_id INTEGER;
  i INTEGER;
  v_position_index INTEGER;
BEGIN
  -- Determine grid size based on difficulty
  v_grid_size := CASE p_difficulty
    WHEN 'easy' THEN 12
    WHEN 'medium' THEN 20
    WHEN 'hard' THEN 30
  END;

  -- Generate shuffled positions for the cards
  v_shuffled_positions := ARRAY(
    SELECT generate_series(0, v_grid_size - 1) ORDER BY random()
  );

  -- Select random careers from cm_career_roles (active only)
  -- Loop through selected careers and create card pairs
  v_position_index := 1;
  v_pair_id := 1;

  FOR v_selected_careers IN (
    SELECT id, career_name, career_image_path
    FROM cm_career_roles
    WHERE is_active = true
    ORDER BY random()
    LIMIT (v_grid_size / 2)
  )
  LOOP
    -- Insert first card of pair
    INSERT INTO cm_cards (
      room_id,
      position,
      career_role_id,
      career_name,
      career_image_path,
      pair_id
    ) VALUES (
      p_room_id,
      v_shuffled_positions[v_position_index],
      v_selected_careers.id,
      v_selected_careers.career_name,
      v_selected_careers.career_image_path,
      v_pair_id
    );

    -- Insert second card of pair
    INSERT INTO cm_cards (
      room_id,
      position,
      career_role_id,
      career_name,
      career_image_path,
      pair_id
    ) VALUES (
      p_room_id,
      v_shuffled_positions[v_position_index + 1],
      v_selected_careers.id,
      v_selected_careers.career_name,
      v_selected_careers.career_image_path,
      v_pair_id
    );

    v_position_index := v_position_index + 2;
    v_pair_id := v_pair_id + 1;
  END LOOP;

  RAISE NOTICE 'Initialized % cards for room % (difficulty: %)', v_grid_size, p_room_id, p_difficulty;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cm_initialize_cards IS 'Initialize cards for a game room by selecting random careers from cm_career_roles';

-- ============================================================================
-- ENABLE RLS (Row Level Security)
-- ============================================================================

ALTER TABLE cm_career_roles ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read active career roles
CREATE POLICY "Career roles are viewable by everyone"
  ON cm_career_roles FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

-- Policy: Only service role can modify career roles
CREATE POLICY "Only service role can modify career roles"
  ON cm_career_roles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
