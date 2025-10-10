-- TEMPORARY TESTING POLICIES
-- Remove these once you verify migrations are applied correctly
-- These allow any authenticated user to write to the tables

-- Temporary permissive policy for container_sessions
DROP POLICY IF EXISTS "Temp: Allow authenticated users to insert container_sessions" ON container_sessions;
CREATE POLICY "Temp: Allow authenticated users to insert container_sessions"
  ON container_sessions
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Temporary permissive policy for pathiq_profiles
DROP POLICY IF EXISTS "Temp: Allow authenticated users to manage pathiq_profiles" ON pathiq_profiles;
CREATE POLICY "Temp: Allow authenticated users to manage pathiq_profiles"
  ON pathiq_profiles
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Temporary permissive policy for xp_transactions
DROP POLICY IF EXISTS "Temp: Allow authenticated users to insert xp_transactions" ON xp_transactions;
CREATE POLICY "Temp: Allow authenticated users to insert xp_transactions"
  ON xp_transactions
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Temporary permissive policy for journey_summaries
DROP POLICY IF EXISTS "Temp: Allow authenticated users to manage journey_summaries" ON journey_summaries;
CREATE POLICY "Temp: Allow authenticated users to manage journey_summaries"
  ON journey_summaries
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- TO REMOVE THESE LATER:
-- DROP POLICY "Temp: Allow authenticated users to insert container_sessions" ON container_sessions;
-- DROP POLICY "Temp: Allow authenticated users to manage pathiq_profiles" ON pathiq_profiles;
-- DROP POLICY "Temp: Allow authenticated users to insert xp_transactions" ON xp_transactions;
-- DROP POLICY "Temp: Allow authenticated users to manage journey_summaries" ON journey_summaries;
