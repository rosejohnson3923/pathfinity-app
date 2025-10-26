-- ================================================================
-- MIGRATION 072b: Fix existing matched cards to have M3 state
-- ================================================================
-- After adding match_state column, existing matched cards have:
--   is_matched = true
--   match_state = NULL (newly added column)
--
-- This causes issues because UI thinks they're face-down but
-- service knows they're matched.
--
-- Fix: Update all currently matched cards to have match_state = 'M3'
-- ================================================================

UPDATE cm_cards
SET match_state = 'M3'
WHERE is_matched = true
  AND match_state IS NULL;

-- Verification
DO $$
DECLARE
    updated_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO updated_count
    FROM cm_cards
    WHERE is_matched = true AND match_state = 'M3';

    RAISE NOTICE '';
    RAISE NOTICE '✅ Migration 072b: Fixed existing matched cards';
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '   Matched cards with M3 state: %', updated_count;
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '';
END $$;
