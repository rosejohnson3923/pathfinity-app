-- ================================================================
-- MIGRATION 072c: Clean up card states from testing
-- ================================================================
-- Reset all cards to proper initial state (NULL)
-- Cards should only have match_state when actively being played
-- ================================================================

-- Reset all cards to NULL state (face-down)
UPDATE cm_cards
SET match_state = NULL
WHERE match_state IS NOT NULL
  AND is_matched = false;

-- Ensure matched cards have M3 state
UPDATE cm_cards
SET match_state = 'M3'
WHERE is_matched = true
  AND match_state != 'M3';

-- Verification
DO $$
DECLARE
    null_count INTEGER;
    m3_count INTEGER;
    total_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO null_count FROM cm_cards WHERE match_state IS NULL;
    SELECT COUNT(*) INTO m3_count FROM cm_cards WHERE match_state = 'M3';
    SELECT COUNT(*) INTO total_count FROM cm_cards;

    RAISE NOTICE '';
    RAISE NOTICE '✅ Migration 072c: Card states cleaned up';
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '   Total cards: %', total_count;
    RAISE NOTICE '   Face-down (NULL): %', null_count;
    RAISE NOTICE '   Matched (M3): %', m3_count;
    RAISE NOTICE '   ════════════════════════════════════════';
    RAISE NOTICE '';
END $$;
