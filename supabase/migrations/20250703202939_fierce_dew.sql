/*
  # Add uid() Helper Function

  1. Purpose
    - Create a helper function to get the current authenticated user ID
    - This simplifies RLS policies and improves performance
    - Replaces the need for (select auth.uid()) in policies

  2. Benefits
    - More readable policies
    - Better performance
    - Consistent user ID access across functions and policies
*/

-- Create the uid() function
CREATE OR REPLACE FUNCTION uid()
RETURNS uuid
LANGUAGE sql STABLE
AS $$
  SELECT auth.uid()
$$;