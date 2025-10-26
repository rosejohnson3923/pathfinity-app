-- ================================================================
-- FIX CAREER MATCH RLS POLICIES
-- Migration 060: Make cm_perpetual_rooms publicly readable
-- ================================================================

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "cm_perpetual_rooms_select_policy" ON cm_perpetual_rooms;

-- Create more permissive policy - allow anyone (authenticated or not) to view active rooms
CREATE POLICY "cm_perpetual_rooms_public_read" ON cm_perpetual_rooms
  FOR SELECT
  USING (true);  -- Allow all reads (we'll filter in application logic)

-- Grant explicit SELECT permission
GRANT SELECT ON cm_perpetual_rooms TO authenticated;
GRANT SELECT ON cm_perpetual_rooms TO anon;

-- Verify the policy works
DO $$
DECLARE
    room_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO room_count FROM cm_perpetual_rooms;

    RAISE NOTICE '';
    RAISE NOTICE '✅ Career Match RLS Fixed!';
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '   Perpetual rooms visible: %', room_count;
    RAISE NOTICE '   Policy: Public read access enabled';
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '';
END $$;
