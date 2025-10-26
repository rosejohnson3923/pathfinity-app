-- Update cm_initialize_cards function to use correct image filenames
-- Run this after migration 058 to fix image paths

CREATE OR REPLACE FUNCTION cm_initialize_cards(
  p_room_id UUID,
  p_difficulty VARCHAR(10)
)
RETURNS VOID AS $$
DECLARE
  v_grid_size INTEGER;
  v_careers TEXT[];
  v_shuffled_careers TEXT[];
  v_shuffled_positions INTEGER[];
  v_career_name TEXT;
  v_pair_id INTEGER;
  i INTEGER;
BEGIN
  -- Determine grid size based on difficulty
  v_grid_size := CASE p_difficulty
    WHEN 'easy' THEN 12
    WHEN 'medium' THEN 20
    WHEN 'hard' THEN 30
  END;

  -- All 50 available career roles (image files renamed to match career names)
  v_careers := ARRAY[
    '3D Artist', 'Accountant', 'Auditor', 'Broadcast Engineer', 'Business Developer',
    'Cloud Security Engineer', 'Community Manager', 'Content Creator', 'Customer Support',
    'CyberSecurity Analyst', 'Equipment Manager', 'Esports Agent', 'Esports Analyst',
    'Esports Asst Coach', 'Esports Nutritionist', 'Event Manager', 'Facilities Manager',
    'Financial Analyst', 'Fitness Coach', 'Game Designer', 'General Manager',
    'Graphic Designer', 'Head Chef', 'Head Coach', 'HR Manager', 'Influencer',
    'IT Coordinator', 'Journalist', 'Lawyer', 'Lighting Tech', 'Performance Coach',
    'Photographer', 'Production Manager', 'Product Manager', 'Program Manager',
    'Project Manager', 'Psychologist', 'Public Relations Specialist', 'Scriptwriter',
    'Social Media Manager', 'Software Engineer', 'Sound Engineer', 'Sponsorship Coordinator',
    'Talent Scout', 'Team Captain', 'Team Manager', 'Tech Support', 'Travel Coordinator',
    'Treasurer', 'Videographer'
  ];

  -- Shuffle and select careers needed for this difficulty
  v_shuffled_careers := ARRAY(
    SELECT unnest(v_careers) ORDER BY random() LIMIT (v_grid_size / 2)
  );

  -- Generate shuffled positions for the cards
  v_shuffled_positions := ARRAY(
    SELECT generate_series(0, v_grid_size - 1) ORDER BY random()
  );

  -- Create card pairs
  FOR i IN 0..(v_grid_size / 2 - 1) LOOP
    v_career_name := v_shuffled_careers[i + 1];
    v_pair_id := i;

    -- Insert first card of pair
    INSERT INTO cm_cards (
      room_id, position, career_name, career_image_path, pair_id
    ) VALUES (
      p_room_id,
      v_shuffled_positions[i * 2 + 1],
      v_career_name,
      '/assets/Discovered Live/Role - Landscape/' || v_career_name || '.png',
      v_pair_id
    );

    -- Insert second card of pair
    INSERT INTO cm_cards (
      room_id, position, career_name, career_image_path, pair_id
    ) VALUES (
      p_room_id,
      v_shuffled_positions[i * 2 + 2],
      v_career_name,
      '/assets/Discovered Live/Role - Landscape/' || v_career_name || '.png',
      v_pair_id
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Test the function
DO $$
DECLARE
  test_room_id UUID := uuid_generate_v4();
  card_record RECORD;
BEGIN
  RAISE NOTICE 'Testing cm_initialize_cards function...';

  -- Create test room
  INSERT INTO cm_rooms (id, room_code, difficulty, grid_size, total_pairs, status)
  VALUES (test_room_id, 'TEST01', 'easy', 12, 6, 'active');

  -- Initialize cards
  PERFORM cm_initialize_cards(test_room_id, 'easy');

  -- Verify cards were created
  IF (SELECT COUNT(*) FROM cm_cards WHERE room_id = test_room_id) = 12 THEN
    RAISE NOTICE '✅ SUCCESS: 12 cards created for easy mode';
  ELSE
    RAISE EXCEPTION '❌ FAIL: Expected 12 cards, got %', (SELECT COUNT(*) FROM cm_cards WHERE room_id = test_room_id);
  END IF;

  -- Verify all cards have valid image paths
  IF (SELECT COUNT(*) FROM cm_cards WHERE room_id = test_room_id AND career_image_path LIKE '%/assets/Discovered Live/Role - Landscape/%') = 12 THEN
    RAISE NOTICE '✅ SUCCESS: All cards have valid image paths';
  ELSE
    RAISE EXCEPTION '❌ FAIL: Some cards have invalid image paths';
  END IF;

  -- Show sample cards
  RAISE NOTICE 'Sample cards:';
  FOR card_record IN (SELECT career_name, pair_id, position FROM cm_cards WHERE room_id = test_room_id LIMIT 5) LOOP
    RAISE NOTICE '  - % (pair %, position %)', card_record.career_name, card_record.pair_id, card_record.position;
  END LOOP;

  -- Cleanup test data
  DELETE FROM cm_rooms WHERE id = test_room_id;

  RAISE NOTICE '✅ cm_initialize_cards function updated and tested successfully!';
END $$;
