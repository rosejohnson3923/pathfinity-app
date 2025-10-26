-- Verify the cm_initialize_cards function is using the correct column name
-- This will show you the function definition

SELECT
  proname as function_name,
  prosrc as function_body
FROM pg_proc
WHERE proname = 'cm_initialize_cards';

-- You should see "career_name" in the function body, not "role_name"
