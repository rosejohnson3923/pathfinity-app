-- ================================================================
-- ENABLE REALTIME FOR CAREER MATCH TABLES
-- Migration 067: Enable Supabase Realtime for multiplayer sync
-- ================================================================
-- Realtime requires:
-- 1. REPLICA IDENTITY FULL - to get old/new values in changes
-- 2. Tables added to supabase_realtime publication
-- ================================================================

-- Set replica identity to FULL (required for UPDATE events to show old values)
ALTER TABLE cm_perpetual_rooms REPLICA IDENTITY FULL;
ALTER TABLE cm_game_sessions REPLICA IDENTITY FULL;
ALTER TABLE cm_session_participants REPLICA IDENTITY FULL;
ALTER TABLE cm_cards REPLICA IDENTITY FULL;
ALTER TABLE cm_moves REPLICA IDENTITY FULL;

-- Add tables to supabase_realtime publication
-- This allows Supabase to broadcast postgres_changes events
ALTER PUBLICATION supabase_realtime ADD TABLE cm_perpetual_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE cm_game_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE cm_session_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE cm_cards;
ALTER PUBLICATION supabase_realtime ADD TABLE cm_moves;

-- Verification
DO $$
DECLARE
    pub_count INTEGER;
BEGIN
    -- Count how many CM tables are in the publication
    SELECT COUNT(*) INTO pub_count
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename LIKE 'cm_%';

    RAISE NOTICE '';
    RAISE NOTICE '✅ Career Match Realtime Enabled';
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '   Tables with REPLICA IDENTITY FULL: 5';
    RAISE NOTICE '   Tables in supabase_realtime publication: %', pub_count;
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '   Real-time multiplayer sync is now active!';
    RAISE NOTICE '';
END $$;
