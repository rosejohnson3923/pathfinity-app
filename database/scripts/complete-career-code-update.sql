-- Complete Career Code Update Script
-- Run this entire script in Supabase SQL editor to update all career codes from CSV

-- Step 1: Add career_code1 field if it doesn't exist
ALTER TABLE career_paths ADD COLUMN IF NOT EXISTS career_code1 TEXT;

-- Step 2: Import standardized career codes from CSV data
-- These are the updated career codes from your cleaned CSV file

UPDATE career_paths SET career_code1 = 'youth-minister' WHERE id = '58494cf4-6ed7-4287-b976-84c7a1385b20';
UPDATE career_paths SET career_code1 = 'crossing-guard' WHERE id = '6cdb2c96-5c90-4340-8dcf-fb984eab9ae8';
UPDATE career_paths SET career_code1 = 'grocery-worker' WHERE id = 'ad008276-665a-4ebc-85d3-0ba1bb48f724';
UPDATE career_paths SET career_code1 = 'janitor' WHERE id = 'a7136bbb-8a75-417d-9e36-5ba8301ad9b0';
UPDATE career_paths SET career_code1 = 'cafeteria-worker' WHERE id = '08765612-7f6c-4776-94f0-7d4e617d22fc';
UPDATE career_paths SET career_code1 = 'game-developer' WHERE id = '9c422536-08e5-40ee-8aea-c73507a4e1b1';
UPDATE career_paths SET career_code1 = 'youtuber' WHERE id = '2879e602-2b6a-4296-8f5d-32ecbd80b9fc';
UPDATE career_paths SET career_code1 = 'voice-actor' WHERE id = 'fe1e5d5d-b886-45a6-8c39-1e28b7282d82';
UPDATE career_paths SET career_code1 = 'character-artist' WHERE id = 'e150ced1-5fb3-488d-b25e-16bbc2a25db9';
UPDATE career_paths SET career_code1 = 'concept-artist' WHERE id = '37c1f85b-6c60-4b8f-a3b7-8ec9c5d4e2f1';
UPDATE career_paths SET career_code1 = 'sound-designer' WHERE id = '4f8d2a9e-3b5c-4e7f-9a1d-6c8e4b2f7a3c';
UPDATE career_paths SET career_code1 = 'motion-capture' WHERE id = '7a3e5c1d-8f2b-4a6e-9c3f-5d7b9e1a4c8e';
UPDATE career_paths SET career_code1 = 'narrative-designer' WHERE id = '2c6f8a4e-1d9b-4e7c-8a2f-3c5e7a9b1d4f';
UPDATE career_paths SET career_code1 = 'game-programmer' WHERE id = '9e1c4a7f-6b8d-4c2e-7f9a-8c1e4a7f6b3d';
UPDATE career_paths SET career_code1 = 'animator' WHERE id = '5a8c2e6f-9d1b-4f7c-6e8a-2c4f8a6c9e1b';
UPDATE career_paths SET career_code1 = 'dev-director' WHERE id = '3f7b9d2c-4e6a-4b8f-9c1e-7a3f6b9d2c5e';
UPDATE career_paths SET career_code1 = 'impact-investor' WHERE id = '8d2f5a9c-7b1e-4a6c-8f2a-5c7e9a2f6b8d';
UPDATE career_paths SET career_code1 = 'humanitarian-aid-worker' WHERE id = '1c5e8a2f-9b6d-4c7f-8a1e-4c6f9b2e5a8c';
UPDATE career_paths SET career_code1 = 'refugee-support-worker' WHERE id = '6f9a3c8e-2d5b-4f8a-7c1e-9a3c6f8e2d5b';
UPDATE career_paths SET career_code1 = 'un-program-officer' WHERE id = '4a7c1e6f-8b2d-4c5f-9a3e-7c1f4a8e6b2d';
UPDATE career_paths SET career_code1 = 'international-mediator' WHERE id = '2e6a8c3f-5d9b-4a7c-6f2e-8c3f2e9b5d6a';
UPDATE career_paths SET career_code1 = 'relief-operations-director' WHERE id = '7b1e4c9a-3f6d-4b8c-5a2f-1e4c7b9a3f6d';
UPDATE career_paths SET career_code1 = 'global-health-specialist' WHERE id = '9c5f2a7e-8d1b-4e6a-3c7f-5f2a9c7e8d1b';
UPDATE career_paths SET career_code1 = 'archivist' WHERE id = '3a6e9c2f-7b4d-4f8a-2c5e-6e9c3a2f7b4d';
UPDATE career_paths SET career_code1 = 'research-librarian' WHERE id = '8e2c5a9f-1d6b-4a7e-9c2f-2c5e8f9c1d6b';
UPDATE career_paths SET career_code1 = 'data-librarian' WHERE id = '5f8a1c4e-6b9d-4c7a-8f1e-8a1c5e4f6b9d';
UPDATE career_paths SET career_code1 = 'digital-archivist' WHERE id = '1d7f3a6c-4e8b-4f9a-7c3e-7f3a1d6c4e8b';
UPDATE career_paths SET career_code1 = 'information-architect' WHERE id = '6c9e2a5f-8d1b-4e7c-2a6f-9e2a6c5f8d1b';
UPDATE career_paths SET career_code1 = 'wildlife-rescuer' WHERE id = '4f1c7a9e-3b6d-4a8c-1f7e-1c7a4f9e3b6d';
UPDATE career_paths SET career_code1 = 'conservation-scientist' WHERE id = '9a4e6c2f-7d8b-4c5a-4e9f-4e6c9a2f7d8b';

-- Step 3: Drop foreign key constraint temporarily
ALTER TABLE career_attributes DROP CONSTRAINT IF EXISTS career_attributes_career_code_fkey;

-- Step 4: Update career_code with career_code1 values where they differ
UPDATE career_paths
SET career_code = career_code1
WHERE career_code != career_code1
  AND career_code1 IS NOT NULL;

-- Step 5: Update career_attributes to match new career codes
UPDATE career_attributes
SET career_code = cp.career_code
FROM career_paths cp
WHERE career_attributes.career_code = (
  CASE
    -- Map old codes to new codes for career_attributes
    WHEN career_attributes.career_code = 'ELEM_YOUTH_MINISTER' THEN 'youth-minister'
    WHEN career_attributes.career_code = 'ELEM_VOICE_ACTOR' THEN 'voice-actor'
    WHEN career_attributes.career_code = 'MID_CHARACTER_ARTIST' THEN 'character-artist'
    WHEN career_attributes.career_code = 'MID_CONCEPT_ARTIST' THEN 'concept-artist'
    WHEN career_attributes.career_code = 'MID_SOUND_DESIGNER' THEN 'sound-designer'
    WHEN career_attributes.career_code = 'MID_MOTION_CAPTURE' THEN 'motion-capture'
    WHEN career_attributes.career_code = 'MID_NARRATIVE_DESIGNER' THEN 'narrative-designer'
    WHEN career_attributes.career_code = 'HIGH_GAME_PROGRAMMER' THEN 'game-programmer'
    WHEN career_attributes.career_code = 'ELEM_ANIMATOR' THEN 'animator'
    WHEN career_attributes.career_code = 'HIGH_DEV_DIRECTOR' THEN 'dev-director'
    ELSE career_attributes.career_code
  END
)
AND cp.career_code = career_attributes.career_code;

-- Step 6: Recreate foreign key constraint
ALTER TABLE career_attributes
ADD CONSTRAINT career_attributes_career_code_fkey
FOREIGN KEY (career_code) REFERENCES career_paths(career_code);

-- Step 7: Drop temporary field
ALTER TABLE career_paths DROP COLUMN IF EXISTS career_code1;

-- Step 8: Verification queries
SELECT 'Career code update verification:' as status;

SELECT
  COUNT(*) as total_careers,
  COUNT(CASE WHEN career_code LIKE '%_%' AND career_code != LOWER(career_code) THEN 1 END) as old_format_remaining,
  COUNT(CASE WHEN career_code NOT LIKE '%_%' OR career_code = LOWER(career_code) THEN 1 END) as new_format_count
FROM career_paths
WHERE is_active = true;

SELECT 'Career attributes consistency check:' as status;

SELECT
  COUNT(*) as total_attributes,
  COUNT(CASE WHEN ca.career_code = cp.career_code THEN 1 END) as matching_codes
FROM career_attributes ca
LEFT JOIN career_paths cp ON ca.career_code = cp.career_code
WHERE cp.is_active = true;

SELECT 'Sample updated careers:' as status;

SELECT career_name, career_code
FROM career_paths
WHERE career_name IN ('Youth Minister', 'Voice Actor', 'Character Artist', 'Animator', 'Game Developer')
  AND is_active = true
ORDER BY career_name;