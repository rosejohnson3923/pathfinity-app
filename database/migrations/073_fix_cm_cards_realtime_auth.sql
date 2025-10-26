-- ================================================================
-- MIGRATION 073: Fix Realtime Authorization for cm_cards
-- ================================================================
-- Issue: Card UPDATE events not being broadcast to subscribers
-- Root cause: Missing realtime authorization grants
-- Solution: Grant realtime SELECT to authenticated role
-- ================================================================

-- Drop existing policies and recreate with realtime support
DROP POLICY IF EXISTS "cm_cards_select_all" ON cm_cards;
DROP POLICY IF EXISTS "cm_cards_update_all" ON cm_cards;

-- Realtime requires SELECT policy for broadcasts
-- Policy must allow the SUBSCRIBER (not just the updater) to see the row
CREATE POLICY "cm_cards_realtime_select"
  ON cm_cards
  FOR SELECT
  TO authenticated
  USING (true);  -- Allow ALL authenticated users to subscribe to ANY card changes

-- Allow updates from any authenticated user (for AI players and human players)
CREATE POLICY "cm_cards_realtime_update"
  ON cm_cards
  FOR UPDATE
  TO authenticated
  USING (true)  -- Any authenticated user can update
  WITH CHECK (true);  -- No restrictions on updated values

-- Ensure REPLICA IDENTITY is FULL (required for old/new values)
ALTER TABLE cm_cards REPLICA IDENTITY FULL;

-- Verify table is in realtime publication
DO $$
BEGIN
  -- Check if already in publication
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'cm_cards'
  ) THEN
    -- Add to publication if missing
    ALTER PUBLICATION supabase_realtime ADD TABLE cm_cards;
    RAISE NOTICE 'Added cm_cards to supabase_realtime publication';
  ELSE
    RAISE NOTICE 'cm_cards already in supabase_realtime publication';
  END IF;
END $$;

-- Verification
DO $$
DECLARE
    policy_count INTEGER;
    replica_identity TEXT;
    in_publication BOOLEAN;
BEGIN
    -- Count policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = 'cm_cards'
      AND policyname LIKE '%realtime%';

    -- Check replica identity
    SELECT relreplident INTO replica_identity
    FROM pg_class
    WHERE relname = 'cm_cards';

    -- Check publication
    SELECT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND tablename = 'cm_cards'
    ) INTO in_publication;

    RAISE NOTICE '';
    RAISE NOTICE '✅ Migration 073: Realtime Authorization Fixed';
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '   Realtime policies: %', policy_count;
    RAISE NOTICE '   Replica identity: % (should be ''f'' for FULL)', replica_identity;
    RAISE NOTICE '   In supabase_realtime publication: %', in_publication;
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '   Card UPDATE events should now broadcast!';
    RAISE NOTICE '';
END $$;
