-- ================================================================
-- Server Time Function
-- Purpose: Return server timestamp for clock synchronization
-- ================================================================

-- Function to get current server time
CREATE OR REPLACE FUNCTION get_server_time()
RETURNS timestamptz
LANGUAGE sql
STABLE
AS $$
  SELECT now();
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_server_time() TO authenticated;
GRANT EXECUTE ON FUNCTION get_server_time() TO anon;

COMMENT ON FUNCTION get_server_time() IS 'Returns current server timestamp for clock synchronization in multiplayer games';
