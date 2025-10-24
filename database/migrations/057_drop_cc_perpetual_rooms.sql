-- ================================================================
-- DROP ORPHANED cc_perpetual_rooms TABLE
-- Migration 057: Remove last orphaned table from decoupling
-- ================================================================
-- This table was replaced by:
-- - cb_perpetual_rooms (for Career Bingo)
-- - ccm_perpetual_rooms (for CEO Takeover)
-- ================================================================

-- Verify table exists
DO $$
DECLARE
    table_exists BOOLEAN;
    row_count INTEGER;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM pg_tables
        WHERE schemaname = 'public' AND tablename = 'cc_perpetual_rooms'
    ) INTO table_exists;

    IF table_exists THEN
        SELECT COUNT(*) INTO row_count FROM cc_perpetual_rooms;
        RAISE NOTICE '📋 Found cc_perpetual_rooms with % rows', row_count;
    ELSE
        RAISE NOTICE '⚠️  cc_perpetual_rooms does not exist (already deleted)';
    END IF;
END $$;

-- Drop the table
DROP TABLE IF EXISTS cc_perpetual_rooms CASCADE;

-- Verify deletion
DO $$
DECLARE
    table_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM pg_tables
        WHERE schemaname = 'public' AND tablename = 'cc_perpetual_rooms'
    ) INTO table_exists;

    RAISE NOTICE '';
    IF table_exists THEN
        RAISE WARNING '❌ cc_perpetual_rooms still exists!';
    ELSE
        RAISE NOTICE '✅ SUCCESS! cc_perpetual_rooms has been deleted.';
        RAISE NOTICE '';
        RAISE NOTICE 'Perpetual rooms now using:';
        RAISE NOTICE '   ✅ Career Bingo: cb_perpetual_rooms';
        RAISE NOTICE '   ✅ CEO Takeover: ccm_perpetual_rooms';
    END IF;
    RAISE NOTICE '';
END $$;
